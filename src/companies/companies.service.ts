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

@Injectable()
export class CompaniesService {

    private readonly logger = new Logger(CompaniesService.name)
    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
        private readonly r2Service: R2Service
    ) { }

    async createCompany(name) {
        return await this.prismaService.company.create({ data: { name } })
    }

    async updateCompany(id: string, image: Express.Multer.File, dto: { name?: string, reportingLinkSlug?: string, slaDays?: string }) {

        this.logger.log('Company ID received:', id)
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

        return await this.prismaService.company.update({
            where: { id },
            data: {
                name: dto.name,
                reportingLinkSlug: dto.reportingLinkSlug,
                slaDays: dto.slaDays,
                logoKey: imageKey,
                logoUrl: imageUrl,
            }
        })
    }

    async getCompanyById(id: string) {
        const company = await this.prismaService.company.findUnique({
            where: { id }
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        return company;
    }

    async getCompanies() {
        return await this.prismaService.company.findMany({ include: { users: true } });
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

    async addCategoriesToCompany(companyId: string, dto: AddCategoriesDto) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }, include: { categories: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        const existingCategories = company.categories.map(c => c.categoryName.toLowerCase());
        const newCategories = dto.categoryNames.filter(name => !existingCategories.includes(name.trim().toLowerCase()));

        if (newCategories.length === 0) {
            return company;
        }

        return await this.prismaService.company.update({
            where: { id: companyId },
            data: {
                categories: {
                    create: newCategories.map(name => ({ categoryName: name })),
                },
            },
        });
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

        return await this.prismaService.company.update({
            where: { id: companyId },
            data: {
                reportingPage: {
                    create: { ...dto },
                },
            },
        });
    }

    async updateReportingPage(companyId: string, dto: ReportingPageDto) {
        const company = await this.prismaService.company.findUnique({
            where: { id: companyId }, include: { reportingPage: true },
        });

        if (!company) {
            throw new CompanyNotFoundException();
        }

        if (!company.reportingPage) {
            throw new ReportingPageNotFoundException();
        }

        return await this.prismaService.company.update({
            where: { id: companyId },
            data: {
                reportingPage: {
                    update: { ...dto }
                }
            }
        })
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

        return await this.prismaService.category.delete({
            where: { id: categoryId },
        });
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

        return await this.prismaService.company.update({
            where: { id: companyId },
            data: {
                categories: {
                    update: { where: { id: categoryId }, data: { categoryName } },
                },
            },
        });
    }
}
