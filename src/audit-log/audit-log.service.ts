import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
    constructor(private readonly prismaService: PrismaService){}

    async createAuditLog(log: string, details: string, companyId: string) {
        await this.prismaService.auditLog.create({
            data: {
                companyId,
                log,
                details
            }
        })
    }
}
