import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyNotFoundException } from '../companies/exceptions/company-not-found.exception';
import { IncidentNotFoundException } from '../incidents/exceptions/incident-not-found.exception';
import { AuditLogService } from '../audit-log/audit-log.service';
import { HandlerNotFoundException } from './exceptions/handler-not-found.exception';

@Injectable()
export class HandlersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditLog: AuditLogService
    ) { }

    // get handler details
    async getHandlerDetails(handlerId: string) {
        try {
            return await this.prisma.incidentHandler.findUnique({ where: { id: handlerId } });
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // get a handler's incidents
    async getHandlerIncidents(handlerId: string) {
        try {
            const handler = await this.prisma.incidentHandler.findUnique({ where: { id: handlerId } });

            if (!handler) throw new HandlerNotFoundException(handlerId);

            const handlerIncidents = await this.prisma.incidentHandler.findMany({
                where: {
                    id: handlerId,
                },
                select: {
                    incident: true
                }

            })
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // assign an incident to a handler
    async assignHandler(handlerId: string, incidentId: string) {
        try {
            const incident = await this.prisma.incident.findUnique({ where: { id: incidentId } })

            if (!incident) throw new IncidentNotFoundException(incidentId);

            return await this.prisma.incidentHandler.update({
                where: {
                    id: handlerId,
                },
                data: {
                    incidentId
                }
            });

        } catch (error) {
            throw new Error(String(error))
        }
    }



}
