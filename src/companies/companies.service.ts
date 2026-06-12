import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddUsersDto } from './dto/add-users.dto';
import { CompanyNotFoundException } from './exceptions/company-not-found.exception';
import { UsersNotFoundException } from './exceptions/users-not-found.exception';
import { ReportingPageDto } from './dto/reporting-page.dto';
import { AddCategoriesDto } from './dto/add-categories.dto';
import { ReportingPageNotFoundException } from './exceptions/reporting-page-not-found.exception';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { R2Service } from '../r2/r2.service';
import { PaginationDto } from './dto/pagination.dto';
import { CompanyWhereInput } from '../generated/prisma/models';

@Injectable()
export class CompaniesService {

    private readonly logger = new Logger(CompaniesService.name)
    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
        private readonly r2Service: R2Service
    ) { }

    async createAuditLog(log: string, details: string, companyId: string) {
        await this.prismaService.auditLog.create({
            data: {
                companyId,
                log,
                details
            }
        })
    }

    async createCompany(name) {
        const res = await this.prismaService.company.create({ data: { name } });

        // create reporting page
        await this.prismaService.reportingPage.create({
            data: {
                companyId: res.id
            }
        })
        await this.createAuditLog("Company added", `${res.name} successfully added to SemaFacts whistleblowing system`, res.id)
        return res;
    }

    async updateCompany(id: string, image: Express.Multer.File, dto: { name?: string, reportingLinkSlug?: string, slaDays?: string }) {
        const company = await this.prismaService.company.findUnique({
            where: { id }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        let imageKey, imageUrl;
        if (image instanceof File && image.size > 0) {
            const { key, publicUrl } = await this.r2Service.uploadFile(image, 'logos')
            imageKey = key;
            imageUrl = publicUrl;
        }

        const res = await this.prismaService.company.update({
            where: { id },
            data: {
                name: dto.name,
                reportingLinkSlug: dto.reportingLinkSlug,
                slaDays: dto.slaDays,
                logoKey: imageKey,
                logoUrl: imageUrl,
            }
        });

        await this.createAuditLog("Company updated", `${res.name} successfully updated`, res.id)
        return res;
    }

    async getCompanyById(id: string) {

        const company = await this.prismaService.company.findUnique({
            where: { id },
            include: {
                reportingPage: {
                    where: {
                        companyId: id
                    }
                },
                categories: true
            },
        });

        this.logger.log(`Company data: ${company}`)
        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company;
    }

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
                    {
                        reportingLinkSlug: {
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

    async getCompanyUsers(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            include: { users: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company.users;
    }

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

    async getCompanyReportingPage(companyId: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId },
            include: { reportingPage: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company.reportingPage;
    }

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

    async addCategoryToCompany(companyId: string, categoryName: string ) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }, include: { categories: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        const res =  await this.prismaService.category.create({
            data: {
                companyId,
                categoryName
            }
        });

        await this.createAuditLog("Category added", `${company.name} added a new category: ${categoryName}`, companyId)
        return res;
    }

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

        await this.createAuditLog("Reporting page added", `Reporting page for ${res.name} successfully added`, res.id)
        return res;
    }

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
        })

        await this.createAuditLog('Reporting page updated', `Reporting page for ${company.name} was successfully updated`, company.id)
        return res;
    }

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

        await this.createAuditLog("Category deleted", `${company.name} deleted the category name: ${res.categoryName}`, companyId);
        return res;
    }

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

        await this.createAuditLog("Category updated", `${company.name} successfully updated a category name`, res.id);
        return res;
    }
}
