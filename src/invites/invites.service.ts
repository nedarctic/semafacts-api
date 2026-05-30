import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { InviteTokenExpiredException } from './exceptions/invite-token-expired.exception';
import { InviteTokenNotFoundException } from './exceptions/invite-token-not-found.exception';
import { InviteAlreadyUsedException } from './exceptions/invite-token-already-used.exception';

@Injectable()
export class InvitesService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ){}

    async createInvite(email: string, companyId: string){
        const rawToken = this.generateToken();
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // get user id using email
        const user = await this.usersService.getUserByEmail(email);

        await this.prismaService.inviteToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt
            }
        });

        // get company name using company id
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }
        });

        // send the email with the raw token
        const inviteLink = `${this.configService.get('frontend_url')}/invites/verify?token=${rawToken}`;
        const emailContent = `
            <p>You have been invited to join ${company?.name}. Click the link below to accept the invitation:</p>
            <a href="${inviteLink}">Accept Invite</a>
            <p>This link will expire in 24 hours.</p>
        `;

        await this.emailService.sendEmail(email, `You are invited to join ${company?.name}`, emailContent);
    }

    async verifyInvite(token: string){
        // hash the incoming token
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // find the invite token in the database
        const invite = await this.prismaService.inviteToken.findUnique({
            where: { tokenHash }
        });

        if (!invite) {
            throw new InviteTokenNotFoundException();
        }

        if (invite.expiresAt < new Date()) {
            throw new InviteTokenExpiredException();
        }

        if (invite.used) {
            throw new InviteAlreadyUsedException();
        }

        // mark the invite as used
        await this.prismaService.inviteToken.update({
            where: { id: invite.id },
            data: { used: true }
        });

        // mark the user as active
        await this.usersService.updateUser(invite.userId, { status: 'ACTIVE' });

        return invite.userId;
    }

    private generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }
}
