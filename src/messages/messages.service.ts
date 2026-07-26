import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SenderType } from '../generated/prisma/enums';
import { IncidentNotFoundException } from '../incidents/exceptions/incident-not-found.exception';

@Injectable()
export class MessagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLog: AuditLogService,
    ) { }

    // get messages
    async getIncidentMessages(incidentId: string) {
        try {
            const incident = await this.prisma.incident.findUnique({
                where: {
                    id: incidentId
                }
            });

            if (!incident) throw new IncidentNotFoundException(incidentId);

            return await this.prisma.message.findMany({
                where: {
                    incidentId
                }
            });

        } catch (error) {
            throw error;
        }
    }

    // create message
    async createMessage(incidentId: string, content: string, senderType: SenderType, handlerId?: string) {
        try {
            return await this.prisma.message.create({
                data: {
                    content,
                    incidentId,
                    senderType,
                    userId: handlerId,
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

}
