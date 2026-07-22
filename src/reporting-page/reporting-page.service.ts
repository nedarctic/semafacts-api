import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyNotFoundException } from '../companies/exceptions/company-not-found.exception';

@Injectable()
export class ReportingPageService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async updateReportingPage(companyId: string, dto: {
        title?: string; 
        reportingPageUrl?: string;
        policyUrl?: string;
        introContent?: string;
    }) { 
        try {
            const company = await this.prisma.company.findUnique({
                where: {
                    id: companyId
                }
            });

            if(!company){
                throw new CompanyNotFoundException()
            }

            return await this.prisma.reportingPage.update({
                where: {
                    companyId
                },
                data: {
                    ...dto
                }
            })
        } catch (error) {
            throw error;
        }
    }
}
