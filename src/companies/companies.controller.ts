import { Controller, Post, Get, Param, Body, UseGuards, Patch, Delete } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AddUsersDto } from './dto/add-users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';
import { AddCategoriesDto } from './dto/add-categories.dto';
import { ReportingPageDto as CreateReportingPageDto } from './dto/reporting-page.dto';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {

    constructor(private readonly companiesService: CompaniesService) { }

    // get all companies
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Get()
    getCompanies() {
        return this.companiesService.getCompanies();
    }

    // create new company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    createCompany(@Body() body: CreateCompanyDto) {
        return this.companiesService.createCompany(body);
    }

    // update company details
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':id')
    updateCompany(@Param('id') id: string, @Body() body: CreateCompanyDto) {
        return this.companiesService.updateCompany(id, body);
    }

    // get company by id
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id')
    getCompanyById(@Param('id') id: string) {
        return this.companiesService.getCompanyById(id);
    }    

    // get company users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/users')
    getCompanyUsers(@Param('id') id: string) {
        return this.companiesService.getCompanyUsers(id);
    }

    // get company categories
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/categories')
    getCompanyCategories(@Param('id') id: string) {
        return this.companiesService.getCompanyCategories(id);
    }

    // get company reporting page
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/reporting-page')
    getCompanyReportingPage(@Param('id') id: string) {
        return this.companiesService.getCompanyReportingPage(id);
    }

    // add users to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':id/users')
    addUsersToCompany(@Param('id') id: string, @Body() body: AddUsersDto) {
        return this.companiesService.addUsersToCompany(id, body);
    }

    // add categories to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':id/categories')
    addCategoriesToCompany(@Param('id') id: string, @Body() body: AddCategoriesDto) {
        return this.companiesService.addCategoriesToCompany(id, body);
    }

    // update company category name
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':id/categories/:categoryId')
    updateCompanyCategory(@Param('id') id: string, @Param('categoryId') categoryId: string, @Body() body: { categoryName: string }) {
        return this.companiesService.updateCompanyCategory(id, categoryId, body.categoryName);
    }

    // delete category from company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Delete(':id/categories/:categoryId')
    deleteCategoryFromCompany(@Param('id') id: string, @Param('categoryId') categoryId: string) {
        return this.companiesService.deleteCategoryFromCompany(id, categoryId);
    }

    // add reporting page to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':id/reporting-page')
    addReportingPageToCompany(@Param('id') id: string, @Body() body: CreateReportingPageDto) {
        return this.companiesService.addReportingPageToCompany(id, body);
    }

    // update reporting page    
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':id/reporting-page/')
    updateReportingPage(@Param('id') id: string, @Body() body: CreateReportingPageDto) {
        return this.companiesService.updateReportingPage(id, body);
    }
}
