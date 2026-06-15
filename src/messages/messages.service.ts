import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SenderType } from '../generated/prisma/enums';

@Injectable()
export class MessagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLog: AuditLogService,
    ) { }

    // create message
    async createMessage(incidentId: string, content: string, senderType: SenderType) {
        try {
            return await this.prisma.message.create({
                data: {
                    content,
                    incidentId,
                    senderType
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

}
