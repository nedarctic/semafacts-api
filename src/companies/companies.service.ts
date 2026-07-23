import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PaginationDto } from '../common/pagination.dto';
import { CompanyWhereInput, IncidentWhereInput, UserWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { AddUsersDto } from './dto/add-users.dto';
import { ReportingPageDto } from './dto/reporting-page.dto';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';
import { CompanyNotFoundException } from './exceptions/company-not-found.exception';
import { UsersNotFoundException } from './exceptions/users-not-found.exception';
import { UserRole, UserStatus } from '../generated/prisma/enums';
import { EmailService } from '../email/email.service';

@Injectable()
export class CompaniesService {

    private readonly logger = new Logger(CompaniesService.name)
    constructor(
        private readonly auditLog: AuditLogService,
        private readonly prismaService: PrismaService,
        private readonly r2Service: R2Service,
        private readonly mail: EmailService,
    ) { }

    // get company by id
    async getCompanyById(id: string) {

        const company = await this.prismaService.company.findUnique({
            where: { id }
        });

        this.logger.log(`Company data: ${company}`)
        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company;
    }

    // get all companies
    async getCompanies(pagination: PaginationDto) {
        const {
            page = 1,
            limit = 10,
            search
        } = pagination;

        const skip = (page - 1) * limit;

        const where: CompanyWhereInput = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : {};

        const [companies, total] = await Promise.all([
            await this.prismaService.company.findMany({
                skip,
                take: limit,
                where,
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    users: true
                }
            }),
            await this.prismaService.company.count({
                where
            }),
        ])


        return {
            companies,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    // get a company's users
    async getCompanyUsers(companyId: string, pagination: PaginationDto) {

        try {
            const {
                limit = 10,
                page = 1,
                search
            } = pagination;

            const skip = (page - 1) * limit;
            const roleFilter = search
                ? Object.values(UserRole).find(
                    role => role.toLowerCase() === search.toLowerCase()
                )
                : undefined;

            const usersWhere: UserWhereInput | undefined = search ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    ...(roleFilter ? [
                        {
                            role: {
                                equals: roleFilter
                            }
                        }
                    ] : [])
                ]
            } : undefined;

            const company = await this.prismaService.company.findUnique({
                where: {
                    id: companyId
                }
            })

            if (!company) {
                throw new CompanyNotFoundException();
            }

            const [users, total] = await Promise.all([
                await this.prismaService.company.findUnique({
                    where: {
                        id: companyId
                    },
                    select: {
                        users: {
                            skip,
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: limit,
                            where: usersWhere
                        }
                    }
                }).then(res => res!.users).then(users => users.map(({
                    password,
                    createdAt,
                    updatedAt,
                    ...user
                }) => ({
                    ...user,
                    createdAt: createdAt.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }),
                    updatedAt: updatedAt.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }),
                }))),
                await this.prismaService.company.findUnique({
                    where: {
                        id: companyId,
                    },
                    select: {
                        _count: {
                            select: {
                                users: {
                                    where: usersWhere,

                                },

                            }
                        }
                    }
                }).then(res => res?._count.users!)
            ]);

            return {
                users,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }

        } catch (error) {
            throw error;
        }
    }

    // get the total users of a company
    async getTotalCompanyUsers(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                _count: {
                    select: {
                        users: true
                    }
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company._count.users;
    }

    // get the total admins of a company
    async getTotalCompanyAdmins(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                _count: {
                    select: {
                        users: {
                            where: {
                                role: UserRole.ADMIN
                            }
                        }
                    }
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company._count.users;
    }

    // get the total handlers of a company
    async getTotalCompanyHandlers(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                _count: {
                    select: {
                        users: {
                            where: {
                                role: UserRole.HANDLER
                            }
                        }
                    }
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company._count.users;
    }

    // get the total invited users of a company
    async getTotalCompanyInvitedUsers(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                _count: {
                    select: {
                        users: {
                            where: {
                                status: UserStatus.INVITED
                            }
                        }
                    }
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company._count.users;
    }

    // get the total inactive users of a company
    async getTotalCompanyInactiveUsers(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                _count: {
                    select: {
                        users: {
                            where: {
                                status: UserStatus.INACTIVE
                            }
                        }
                    }
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company._count.users;
    }

    // get the total active users of a company
    async getTotalCompanyActiveUsers(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                _count: {
                    select: {
                        users: {
                            where: {
                                status: UserStatus.ACTIVE
                            }
                        }
                    }
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company._count.users;
    }

    // get the total incidents of a company
    async getTotalCompanyIncidents(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                _count: {
                    select: {
                        incidents: true
                    }
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company._count.incidents;
    }

    // get a company's audit logs
    async getCompanyAuditLogs(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            select: {
                auditLogs: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 5
                }
            }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company.auditLogs;
    }

    // get a company's reporting categories
    async getCompanyCategories(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            include: { categories: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company.categories;
    }

    // get a company's reporting page
    async getCompanyReportingPage(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            include: { reportingPage: true, categories: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        const { categories, reportingPage } = company;
        return {
            categories,
            reportingPage
        }
    }

    // get a company's handlers, if incidentId is provided, get handlers for other incidents
    async getCompanyHandlers(companyId: string, incidentId?: string) {

        try {
            const company = await this.prismaService.company.findUnique({ where: { id: companyId } })

            if (!company) throw new CompanyNotFoundException();

            const incidentFilter: UserWhereInput = incidentId ? {
                NOT: {
                    incidentHandlers: {
                        some: {
                            incidentId
                        }
                    }
                }
            } : {};

            const companyHandlers = await this.prismaService.company.findUnique({
                where: {
                    id: companyId
                },
                select: {
                    users: {
                        where: {
                            role: UserRole.HANDLER,
                            ...incidentFilter
                        }
                    }
                }
            })

            return companyHandlers;

        } catch (error) {
            throw new Error(String(error));
        }
    }

    // get a company's incidents
    async getCompanyIncidents(companyId: string, pagination: PaginationDto) {
        try {

            const {
                limit = 10,
                page = 1,
                search
            } = pagination;

            const skip = (page - 1) * limit;

            const where: IncidentWhereInput = search
                ? {
                    OR: [
                        {
                            location: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            category: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            duration: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {};

            const company = await this.prismaService.company.findUnique({ where: { id: companyId } })

            if (!company) throw new CompanyNotFoundException();

            const [incidents, total] = await Promise.all([
                await this.prismaService.incident.findMany({
                    skip,
                    take: limit,
                    where,
                    orderBy: {
                        createdAt: "desc"
                    }
                }).then(incidents => incidents.map(({
                    secretCodeHash,
                    deadlineAt,
                    createdAt,
                    ...incident
                }) => {
                    return {
                        ...incident,
                        createdAt: createdAt.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }),
                        deadlineAt: deadlineAt?.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }),
                    };
                })),
                await this.prismaService.incident.count({
                    where
                }),
            ])


            return {
                incidents,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }

        } catch (error) {
            throw new Error(String(error));
        }
    }

    // create a new company
    async createCompany(name) {
        const res = await this.prismaService.company.create({ data: { name } });

        // create reporting page
        await this.prismaService.reportingPage.create({
            data: {
                companyId: res.id
            }
        })
        await this.auditLog.createAuditLog("Company added", `${res.name} successfully added to SemaFacts whistleblowing system`, res.id)
        return res;
    }

    // add users to a company
    async addUsersToCompany(companyId: string, dto: AddUsersDto) {
        const userIds = dto.userIds;
        const company = await this.prismaService.company.findUnique({ where: { id: companyId } });
        if (!company) {
            throw new CompanyNotFoundException();
        }

        const users = await this.prismaService.user.findMany({
            where: { id: { in: userIds } },
        });

        if (users.length !== userIds.length) {
            throw new UsersNotFoundException();
        }

        await this.prismaService.company.update({
            where: { id: companyId },
            data: {
                users: {
                    connect: userIds.map(id => ({ id })),
                },
            },
        });
        return company;
    }

    // add a category to a company
    async addCategoryToCompany(companyId: string, categoryName: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }, include: { categories: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        const res = await this.prismaService.category.create({
            data: {
                companyId,
                categoryName
            }
        });

        await this.auditLog.createAuditLog("Category added", `${company.name} added a new category: ${categoryName}`, companyId)
        return res;
    }

    // add a reporting page to a company
    async addReportingPageToCompany(companyId: string, dto: ReportingPageDto) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }, include: { reportingPage: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        if (company.reportingPage) {
            return company;
        }

        const res = await this.prismaService.company.update({
            where: { id: companyId },
            data: {
                reportingPage: {
                    create: { ...dto },
                },
            },
        });

        await this.auditLog.createAuditLog("Reporting page added", `Reporting page for ${res.name} successfully added`, res.id)
        return res;
    }

    // send an invitation email to a handler
    async sendInvitationEmail(email: string, companyId: string) {
        try {
            const company = await this.prismaService.company.findUnique({ where: { id: companyId } });

            if (!company) {
                throw new CompanyNotFoundException();
            }

            const { name } = company;
            return await this.mail.sendInviteMail(email, name);
        } catch (error) {
            throw error;
        }
    }

    // update a company's reporting page
    async updateReportingPage(companyId: string, dto: ReportingPageDto) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        const res = await this.prismaService.reportingPage.update({
            where: {
                companyId
            },
            data: {
                ...dto
            }
        });

        await this.auditLog.createAuditLog('Reporting page updated', `Reporting page for ${company.name} was successfully updated`, company.id)
        return res;
    }

    // update a company's general info
    async updateCompany(id: string, image: Express.Multer.File, dto: { name?: string, slaDays?: string }) {
        try {
            const company = await this.prismaService.company.findUnique({
                where: { id }
            });

            if (!company) {
                throw new CompanyNotFoundException();
            }

            if(company.logoKey && image.size > 0){
                await this.r2Service.deleteFile(company.logoKey)
            }

            const { key, publicUrl } = image.size > 0 ? await this.r2Service.uploadFile(image, "logos") : {};

            const res = await this.prismaService.company.update({
                where: { id },
                data: {
                    name: dto.name,
                    slaDays: dto.slaDays,
                    logoKey: key,
                    logoUrl: publicUrl,
                }
            });

            await this.auditLog.createAuditLog("Company updated", `${res.name} successfully updated`, res.id)
            return res;
        } catch (error) {
            throw error;
        }
    }

    // update a specific company's reporting category
    async updateCompanyCategory(companyId: string, categoryId: string, categoryName: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }, include: { categories: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        const category = company.categories.find(c => c.id === categoryId);
        if (!category) {
            throw new CategoryNotFoundException();
        }

        const res = await this.prismaService.company.update({
            where: { id: companyId },
            data: {
                categories: {
                    update: { where: { id: categoryId }, data: { categoryName } },
                },
            },
        });

        await this.auditLog.createAuditLog("Category updated", `${company.name} successfully updated a category name`, res.id);
        return res;
    }

    // delete a company's category
    async deleteCategoryFromCompany(companyId: string, categoryId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }, include: { categories: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        const category = company.categories.find(c => c.id === categoryId);
        if (!category) {
            throw new CategoryNotFoundException();
        }

        const res = await this.prismaService.category.delete({
            where: { id: categoryId },
        });

        await this.auditLog.createAuditLog("Category deleted", `${company.name} deleted the category name: ${res.categoryName}`, companyId);
        return res;
    }
}
