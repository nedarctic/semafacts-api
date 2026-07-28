import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/pagination.dto';
import { UserRole, UserStatus } from '../generated/prisma/enums';
import { UserWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user-not-found.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from "crypto";

@Injectable()
export class UsersService {
    private readonly logger = new Logger();
    constructor(
        private readonly prisma: PrismaService,
        private readonly email: EmailService,
        private readonly config: ConfigService
    ) { }

    // get user by id
    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                incidentHandlers: {
                    include: {
                        incident: true
                    }
                }
            }
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        const { password, ...rest} = user;

        return rest;
    }

    // get user by email
    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    // get users
    async getUsers(pagination: PaginationDto) {

        const {
            page = 1,
            limit = 10,
            search
        } = pagination;


        const skip = (page - 1) * limit;

        const searchUpper = search?.trim().toUpperCase();

        const roleMatch = Object.values(UserRole)
            .includes(searchUpper as UserRole) ?
            (searchUpper as UserRole) :
            undefined;

        const statusMatch = Object.values(UserStatus)
            .includes(searchUpper as UserStatus) ?
            (searchUpper as UserStatus) :
            undefined;

        const where: UserWhereInput = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        company: {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    },

                    ...(roleMatch
                        ? [
                            {
                                role: roleMatch,
                            },
                        ]
                        : []),

                    ...(statusMatch
                        ? [
                            {
                                status: statusMatch,
                            },
                        ]
                        : []),
                ],
            }
            : {};

        const [usersData, total] = await Promise.all([
            await this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    company: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            await this.prisma.user.count({
                where
            })
        ])

        const users = usersData.map(({ company, ...user }) => ({
            ...user,
            companyName: company?.name
        }))

        return {
            users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    // create a user
    async createUser(dto: CreateUserDto) {
        try {
            const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

            return await this.prisma.user.create({ data: { ...dto, password: hashedPassword } })
        } catch (error) {
            throw error;
        }
    }

    // update a user
    async updateUser(id: string, dto: UpdateUserDto) {
        try {
            const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;
            if (hashedPassword) {
                dto.password = hashedPassword;
            }
            return await this.prisma.user.update({
                where: { id },
                data: dto,
            });
        } catch (e) {
            throw new UserNotFoundException();
        }
    }

    // update user password
    async sendPasswordResetEmail (email: string) {
        try {   
            const user = await this.prisma.user.findUnique({
                where: {
                    email
                }
            });

            if(!user) throw new UserNotFoundException();
            const rawToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await this.prisma.inviteToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt
                }
            });
            
            const inviteUrl = `${this.config.get("FRONTEND_URL")}/invite-verification?token=${rawToken}`;

            const subject = "Reset your password";
            const html = `
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
                                <h2 style="margin-top:0;color:#333333;">Reset your password</h2>

                                <p style="font-size:16px;color:#555555;line-height:1.6;">
                                    Hello${user.name ? ` ${user.name}` : ""},
                                </p>

                                <p style="font-size:16px;color:#555555;line-height:1.6;">
                                    We received a request to reset the password for your account. Click the button below to continue.
                                </p>

                                <div style="text-align:center;margin:35px 0;">
                                    <a
                                        href="${inviteUrl}"
                                        style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;"
                                    >
                                        Reset Password
                                    </a>
                                </div>

                                <p style="font-size:14px;color:#777777;line-height:1.6;">
                                    If you did not request this change, you can safely ignore this email.
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
</html>`;

            return await this.email.sendEmail(email, subject, html);
        } catch (error) {
            throw error;
        }
    }

    // deactivate a user
    async deactivateUser(id: string) {
        return await this.prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } })
    }
}
