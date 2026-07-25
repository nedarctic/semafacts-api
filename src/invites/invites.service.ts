import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { UserStatus } from '../generated/prisma/enums';
import { IncidentNotFoundException } from '../incidents/exceptions/incident-not-found.exception';
import { PrismaService } from '../prisma/prisma.service';
import { UserInactiveException } from '../users/dto/user-inactive.exception';
import { UserNotFoundException } from '../users/exceptions/user-not-found.dto';
import { UsersService } from '../users/users.service';
import { InviteAlreadyUsedException } from './exceptions/invite-token-already-used.exception';
import { InviteTokenExpiredException } from './exceptions/invite-token-expired.exception';
import { InviteTokenNotFoundException } from './exceptions/invite-token-not-found.exception';
import { CompanyNotFoundException } from '../companies/exceptions/company-not-found.exception';

@Injectable()
export class InvitesService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ) { }

    private generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    // create invite
    async createInvite(email: string, companyId: string) {

        try {
            const rawToken = this.generateToken();
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // get user id using email
            const user = await this.usersService.getUserByEmail(email);

            if (user.status === UserStatus.ACTIVE) {
                return {
                    message: "User already active"
                }
            }

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
            const inviteLink = `${this.configService.get('FRONTEND_URL')}/invite-verification?token=${rawToken}`;
            const emailContent = `
<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
                        <tr>
                            <td>
                                <h2 style="margin-top:0;color:#333333;">
                                You're Invited!
                                </h2>

                                <p style="font-size:16px;color:#555555;line-height:1.6;">
                                Hello,
                                </p>

                                <p style="font-size:16px;color:#555555;line-height:1.6;">
                                You have been invited to join
                                <strong>${company?.name}</strong>
                                as an <strong>Incident Handler</strong>.
                                </p>

                                <p style="font-size:16px;color:#555555;line-height:1.6;">
                                As an Incident Handler, you'll be able to receive, manage,
                                and respond to incidents assigned to your organization.
                                </p>

                                <div style="text-align:center;margin:35px 0;">
                                    <a
                                        href=${inviteLink}
                                        style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;"
                                    >
                                        Accept Invitation
                                    </a>
                                </div>

                                <p style="font-size:14px;color:#777777;line-height:1.6;">
                                    If you were not expecting this invitation, you can safely
                                    ignore this email.
                                </p>

                                <hr style="border:none;border-top:1px solid #eeeeee;margin:30px 0;" />

                                <p style="font-size:13px;color:#999999;">
                                    This is an automated email. Please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
`

            await this.emailService.sendEmail(email, `You are invited to join ${company?.name}`, emailContent);
        } catch (error) {
            throw error;
        }
    }

    // verify invite
    async verifyInvite(token: string, dto: { password: string; }) {
        try {
            // hash the incoming token
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

            // find the invite token in the database
            const invite = await this.prismaService.inviteToken.findUnique({
                where: { tokenHash }
            });

            if (!invite) {
                throw new InviteTokenNotFoundException();
            }

            const user = this.prismaService.user.findUnique({
                where: {
                    id: invite.userId
                }
            });

            if (!user) {
                throw new UserNotFoundException()
            }

            // update the user password
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            await this.prismaService.user.update({
                where: {
                    id: invite.userId
                },
                data: {
                    password: hashedPassword
                }
            })

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
        } catch (error) {
            throw error;
        }
    }

    // incident invite
    async incidentInvite(companyId: string, incidentId: string, userId: string) {
        try {
            const company = await this.prismaService.company.findUnique({
                where: {
                    id: companyId
                }
            });

            if (!company) {
                throw new CompanyNotFoundException();
            }

            const incident = await this.prismaService.incident.findUnique({
                where: {
                    id: incidentId
                }
            });

            if (!incident) {
                throw new IncidentNotFoundException(incidentId);
            }

            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId
                }
            });

            if (!user) {
                throw new UserNotFoundException();
            }

            if (user.status !== UserStatus.ACTIVE) {
                throw new UserInactiveException();
            }

            

            await this.prismaService.incidentHandler.update({
                where: {
                    id: userId
                },
                data: {
                    incidentId
                }
            });

            return {
                message: "Incident assigned and notification email sent"
            }

        } catch (error) {
            throw error;
        }
    }
}
