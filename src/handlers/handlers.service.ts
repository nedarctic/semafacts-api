import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyNotFoundException } from '../companies/exceptions/company-not-found.exception';
import { IncidentNotFoundException } from '../incidents/exceptions/incident-not-found.exception';
import { AuditLogService } from '../audit-log/audit-log.service';
import { HandlerNotFoundException } from './exceptions/handler-not-found.exception';
import { EmailService } from '../email/email.service';
import { UserNotFoundException } from '../users/exceptions/user-not-found.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HandlersService {

    private readonly logger = new Logger(HandlersService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLog: AuditLogService,
        private readonly email: EmailService,
        private readonly config: ConfigService
    ) { }

    // get handler details
    async getHandlerDetails(handlerId: string) {
        try {

            return await this.prisma.user.findUnique({ where: { id: handlerId } });
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // get a handler's incidents
    async getHandlerIncidents(handlerId: string) {
        try {
            const handler = await this.prisma.user.findUnique({ where: { id: handlerId } });

            if (!handler) throw new HandlerNotFoundException(handlerId);

            return await this.prisma.incident.findMany({
                where: {
                    handlers: {
                        some: {
                            handlerId
                        }
                    }
                }
            });

        } catch (error) {
            throw new Error(String(error));
        }
    }

    // assign an incident to a handler
    async assignHandler(handlerId: string, incidentId: string, email: string) {
        try {
            const incident = await this.prisma.incident.findUnique({ where: { id: incidentId }, include: {company: true} })

            if (!incident) throw new IncidentNotFoundException(incidentId);

            const user = await this.prisma.user.findUnique({
                where: {
                    id: handlerId
                }
            });

            if(!user){
                throw new UserNotFoundException()
            }

            const incidentHandler = await this.prisma.user.findUnique({
                where: {
                    id: handlerId
                }
            });

            await this.prisma.incident.update({
                where: {
                    id: incidentId
                },
                data: {
                    handlers: {
                        create: {
                            handlerId
                        }
                    }
                }
            })

            const handlerPortalUrl = `${this.config.get("FRONTEND_URL")}/handler-login`;

            const subject = "Invitation to handle an incident";
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
                            <h2 style="margin-top:0;color:#333333;">
                                New Incident Assigned
                            </h2>

                            <p style="font-size:16px;color:#555555;line-height:1.6;">
                                Hello,
                            </p>

                            <p style="font-size:16px;color:#555555;line-height:1.6;">
                                A new incident has been assigned to you for handling in
                                <strong>${incident.company.name}</strong>.
                            </p>

                            <p style="font-size:16px;color:#555555;line-height:1.6;">
                                Please sign in to the Incident Management Portal to review
                                the incident details, assess the situation, and take the
                                necessary actions.
                            </p>

                            <div style="text-align:center;margin:35px 0;">
                                <a
                                    href="${handlerPortalUrl}"
                                    style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;"
                                >
                                    Sign In to Portal
                                </a>
                            </div>

                            <p style="font-size:14px;color:#777777;line-height:1.6;">
                                If you cannot see the assigned incident after signing in,
                                please contact your administrator for assistance.
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
`;
            await this.email.sendEmail(email, subject, html);

        } catch (error) {
            throw new Error(String(error))
        }
    }

    // assign handlers to an incident
    async assignHandlers(incidentId: string, handlersIds: string[]) {
        try {
            const incident = await this.prisma.incident.findUnique({
                where: {
                    id: incidentId
                }
            });

            if (!incident) {
                throw new IncidentNotFoundException(incidentId);
            }

            handlersIds.length && await this.prisma.incidentHandler.createMany({
                data: handlersIds.map(handlerId => ({
                    incidentId,
                    handlerId
                }))
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // deassign an incident from a handler
    async deassignHandler(handlerId: string, incidentId: string) {
        try {
            const incident = await this.prisma.incident.findUnique({ where: { id: incidentId } })

            if (!incident) throw new IncidentNotFoundException(incidentId);

            return await this.prisma.incidentHandler.delete({
                where: {
                    incidentId_handlerId: {
                        incidentId,
                        handlerId,
                    }
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }
}
