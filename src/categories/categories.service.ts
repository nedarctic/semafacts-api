import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyNotFoundException } from '../companies/exceptions/company-not-found.exception';
import { CategoryNotFoundException } from './dto/category-not-found-exception';
import { ExistingObjectReplication$ } from '@aws-sdk/client-s3';

@Injectable()
export class CategoriesService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async getCategories(companyId: string) {
        try {
            const company = await this.prisma.company.findUnique({
                where: {
                    id: companyId
                }
            });

            if (!company) {
                throw new CompanyNotFoundException()
            }

            const categories = await this.prisma.category.findMany({
                where: {
                    companyId
                }
            });

            return categories;
        } catch (error) {
            throw error;
        }
    }
    
    async editCategories (categories: {categoryName: string, id: string}[], companyId: string) {
        try {

            const existingCategories = await this.prisma.category.findMany({
                where: {
                    companyId
                }
            });

            const existingIdsSet = new Set<string>();
            for(const category of existingCategories) {
                existingIdsSet.add(category.id)
            }

            const newCategories = categories.filter(category => !existingIdsSet.has(category.id)).map(category => ({...category, companyId}));
            const updatedCategories = categories.filter(category => existingIdsSet.has(category.id)).map(category => ({...category, companyId}));

            await this.prisma.$transaction(
                updatedCategories.map(category => this.prisma.category.update({
                    where: {
                        id: category.id
                    },
                    data: {
                        categoryName: category.categoryName,
                        companyId: category.companyId
                    }
                }))
            );

            await this.prisma.category.createMany({
                data: newCategories
            });

            return {
                message: "Category updates succeeded"
            }

        } catch (error) {
            throw error;
        }
    }

}
