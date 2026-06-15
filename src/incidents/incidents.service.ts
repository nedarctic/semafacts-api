import { Injectable } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SecretCodeService } from '../secret-code/secret-code.service';
import { IncidentNotFoundException } from './exceptions/incident-not-found.exception';
import { AuditLogService } from '../audit-log/audit-log.service';
import { R2Service } from '../r2/r2.service';
import { PaginationDto } from '../common/pagination.dto';
import { IncidentWhereInput } from '../generated/prisma/models';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Injectable()
export class IncidentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly secretCodeService: SecretCodeService,
        private readonly auditLog: AuditLogService,
        private readonly r2: R2Service,
    ) { }

    async getIncidents(pagination: PaginationDto) {

        const {
            limit = 10,
            page = 1,
            search
        } = pagination;

        const skip = (page - 1) * limit;

        const where: IncidentWhereInput = search ? {
            OR: [
                {
                    incidentIdDisplay: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    company: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ]
        } : {};

        const [incidentsData, total] = await Promise.all([
            await this.prisma.incident.findMany({
                take: limit,
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                where,
                include: {
                    company: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            await this.prisma.incident.count({ where })
        ]);

        // map to add companyName field to result
        const incidents = incidentsData.map(({ company, ...rest }) => ({
            ...rest,
            companyName: company.name
        }))

        return {
            incidents,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    async createIncident(companyId: string, attachments: Express.Multer.File[], dto: CreateIncidentDto) {

        try {

            // get id for display and secret code
            const { code, secretCode } = this.secretCodeService.generateCodes();

            // get secret code hash
            const hashedSecret = await this.secretCodeService.hashSecret(secretCode);

            // if file exists create attachment

            // store new incident
            const createdIncident = await this.prisma.incident.create({
                data: {
                    ...dto,
                    companyId,
                    incidentIdDisplay: code,
                    secretCodeHash: hashedSecret
                }
            })

            // store attachments if any

            if (attachments?.length) {
                for (const file of attachments) {
                    let { key, publicUrl } = await this.r2.uploadFile(file, "evidences");

                    await this.prisma.attachment.create({
                        data: {
                            fileKey: key,
                            fileUrl: publicUrl,
                            incidentId: createdIncident.id,
                            uploadedBy: "Reporter"
                        }
                    });
                }
            }

            // log action
            await this.auditLog.createAuditLog('Incident created', `Incident with id ${code} created`, companyId)

            // return incident display id and secret
            return { code, secretCode };

        } catch (error) {
            throw new Error(String(error))
        }
    }

    async getIncident(incidentId: string) {

        const incident = await this.prisma.incident.findUnique({
            where: {
                id: incidentId
            },
            include: {
                company: true,
                attachments: true,
                handlers: true,
                messages: true,
                reporter: true
            }
        });

        if (!incident) {
            throw new IncidentNotFoundException(incidentId);
        }

        return incident;
    }

    async updateIncident(incidentId: string, attachments: Express.Multer.File[], dto: UpdateIncidentDto) {
        const incident = await this.prisma.incident.findUnique({ where: { id: incidentId } });

        if (!incident) {
            throw new IncidentNotFoundException(incidentId);
        }

        try {

            // update incident
            const updatedIncident = await this.prisma.incident.update({
                where: {
                    id: incidentId
                },
                data: {
                    ...dto
                }
            })

            // upload files if any
            if (attachments?.length) {
                for (const attachment of attachments) {
                    const { key, publicUrl } = await this.r2.uploadFile(attachment, "evidences");

                    await this.prisma.attachment.create({
                        data: {
                            incidentId,
                            fileKey: key,
                            fileUrl: publicUrl,
                            uploadedBy: dto.uploadedBy,
                        }
                    });
                }
            }

            // return updated incident
            return updatedIncident;
        } catch (error) {
            throw new Error(String(error))
        }
    }

}
