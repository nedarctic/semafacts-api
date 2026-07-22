import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PaginationDto } from '../common/pagination.dto';
import { IncidentWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { SecretCodeService } from '../secret-code/secret-code.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentNotFoundException } from './exceptions/incident-not-found.exception';
import { CompanyNotFoundException } from '../companies/exceptions/company-not-found.exception';
import { AttachmentUploader, UserRole, UserStatus } from '../generated/prisma/enums';
import { User } from '../generated/prisma/client';

@Injectable()
export class IncidentsService {

    private readonly logger = new Logger(IncidentsService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly secretCodeService: SecretCodeService,
        private readonly auditLog: AuditLogService,
        private readonly r2: R2Service,
    ) { }

    // get incidents
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

    // get company incidents
    async getCompanyIncidents(companyId: string) {
        try {

            const company = await this.prisma.company.findUnique({ where: { id: companyId } });
            if (!company) throw new CompanyNotFoundException();

            const res = await this.prisma.incident.findMany({ where: { companyId } });

            return res;
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // get incident non-handlers
    async getNonIncidentHandlers(incidentId: string, companyId: string) {
        try {
            const incident = await this.prisma.incident.findUnique({
                where: {
                    id: incidentId
                },
                select: {
                    handlers: true
                }
            });

            if (!incident) {
                throw new IncidentNotFoundException(incidentId);
            }

            const { handlers: incidentHandlers } = incident;

            const company = await this.prisma.company.findUnique({
                where: {
                    id: companyId
                },
                select: {
                    users: {
                        where: {
                            role: UserRole.HANDLER
                        }
                    }
                }
            });

            if (!company) {
                throw new CompanyNotFoundException();
            }

            const { users: companyHandlers } = company;

            const companyHandlersIdsSet = new Set<string>();

            companyHandlers.map(handler => {
                companyHandlersIdsSet.add(handler.id)
            });

            incidentHandlers.map(handler => {
                companyHandlersIdsSet.has(handler.id) && companyHandlersIdsSet.delete(handler.id)
            });

            const nonIncidentHandlerIds = companyHandlersIdsSet;

            const nonIncidentHandlers = companyHandlers
                .filter(handler => nonIncidentHandlerIds.has(handler.id) && handler.status === UserStatus.ACTIVE).map(({
                    refreshToken,
                    updatedAt,
                    createdAt,
                    password,
                    ...handler
                }) => {
                    return { ...handler }
                });

            return nonIncidentHandlers;

        } catch (error) {
            throw error;
        }
    }

    // get incident by ID
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

    // create new incident
    async createIncident(companyId: string, attachments: Express.Multer.File[], dto: CreateIncidentDto) {

        try {

            // get sla days for company
            const company = await this.prisma.company.findUnique({
                where: { id: companyId },
            })

            if (!company) {
                throw new CompanyNotFoundException();
            }

            const { slaDays } = company;

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
                    secretCodeHash: hashedSecret,
                    deadlineAt: slaDays ? new Date(Date.now() + parseInt(slaDays) * 24 * 60 * 60 * 1000) : null
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
                            uploadedBy: "Reporter",
                            mimeType: file.mimetype
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

    // update an incident
    async updateIncident(incidentId: string, dto: UpdateIncidentDto, attachments?: Express.Multer.File[], uploadedBy?: AttachmentUploader) {
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
                            uploadedBy: uploadedBy!,
                            mimeType: attachment.mimetype,
                        }
                    });
                }
            }

            // log update
            await this.auditLog.createAuditLog('Incident updated', `Incident ID ${updatedIncident.incidentIdDisplay} just got updated`, updatedIncident.companyId)

            // return updated incident
            return updatedIncident;
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // delete an incident
    async deleteIncident(incidentId: string) {

        try {
            // verify incident exists
            const incident = await this.prisma.incident.findUnique({
                where: {
                    id: incidentId
                }
            })

            if (!incident) throw new IncidentNotFoundException(incidentId);

            // find attachment keys
            const keys = await this.prisma.attachment.findMany({
                where: {
                    incidentId
                },
                select: {
                    fileKey: true,
                }
            })

            // remove incident from database
            const res = await this.prisma.incident.delete({ where: { id: incidentId } })

            // delete remote assets
            for (const key in keys) {
                await this.r2.deleteFile(key)
            }

            return res;
        } catch (error) {
            throw new Error(String(error))
        }
    }

}
