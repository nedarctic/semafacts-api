import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(
        private readonly categoriesService: CategoriesService
    ) { }

    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Get(":companyId")
    async createCategories(
        @Param("companyId") companyId: string
    ) { 
        return await this.categoriesService.getCategories(companyId)
    }

    @Patch(":companyId/update-categories")
    async updateCategories (
        @Param("companyId") companyId: string,
        @Body() categories: {categoryName: string, id: string}[]
    ) {
        return await this.categoriesService.editCategories(categories, companyId)
    }
}
