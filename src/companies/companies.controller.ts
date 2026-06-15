import { Controller, Post, Get, Param, Body, UseGuards, Patch, Delete, Logger, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AddUsersDto } from './dto/add-users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddCategoriesDto } from './dto/add-categories.dto';
import { ReportingPageDto as CreateReportingPageDto, ReportingPageDto } from './dto/reporting-page.dto';
import { PaginationDto } from '../common/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {

    private readonly logger = new Logger(CompaniesController.name)

    constructor(private readonly companiesService: CompaniesService) { }

    // get all companies
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Get()
    async getCompanies(@Query() pagination: PaginationDto) {
        return this.companiesService.getCompanies(pagination);
    }

    // create new company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    async createCompany(@Body() dto: { name: string }) {
        return this.companiesService.createCompany(dto.name);
    }

    // get company by id
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id')
    getCompanyById(@Param('id') id: string) {
        return this.companiesService.getCompanyById(id);
    }

    // update company details
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('image'))
    @Patch(':id')
    async updateCompany(@UploadedFile() image: Express.Multer.File, @Param('id') id: string, @Body() dto: {name?: string, reportingLinkSlug?: string, slaDays?: string }) {
        return this.companiesService.updateCompany(id, image, dto);
    }    

    // get company users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/users')
    async getCompanyUsers(@Param('id') id: string) {
        return this.companiesService.getCompanyUsers(id);
    }

    // get total company users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-users')
    async getTotalCompanyUsers(@Param('id') id: string) {
        return this.companiesService.getTotalCompanyUsers(id);
    }

    // get company total incidents
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-incidents')
    async getTotalCompanyIncidents(@Param('id') id: string) {
        return this.companiesService.getTotalCompanyIncidents(id);
    }

    // get company audit logs
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/audit-logs')
    async getCompanyAuditLogs(@Param('id') id: string) {
        return this.companiesService.getCompanyAuditLogs(id);
    }

    // get company categories
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/categories')
    async getCompanyCategories(@Param('id') id: string) {
        return this.companiesService.getCompanyCategories(id);
    }

    // get company reporting page
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/reporting-page')
    async getCompanyReportingPage(@Param('id') id: string) {
        return this.companiesService.getCompanyReportingPage(id);
    }

    // add users to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':id/users')
    async addUsersToCompany(@Param('id') id: string, @Body() body: AddUsersDto) {
        return this.companiesService.addUsersToCompany(id, body);
    }

    // add categories to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':id/categories')
    async addCategoriesToCompany(@Param('id') id: string, @Body() dto: {categoryName: string}) {
        return this.companiesService.addCategoryToCompany(id, dto.categoryName);
    }

    // update company category name
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':id/categories/:categoryId')
    async updateCompanyCategory(@Param('id') id: string, @Param('categoryId') categoryId: string, @Body() body: { categoryName: string }) {
        return this.companiesService.updateCompanyCategory(id, categoryId, body.categoryName);
    }

    // delete category from company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Delete(':id/categories/:categoryId')
    async deleteCategoryFromCompany(@Param('id') id: string, @Param('categoryId') categoryId: string) {
        return this.companiesService.deleteCategoryFromCompany(id, categoryId);
    }

    // add reporting page to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':id/reporting-page')
    async addReportingPageToCompany(@Param('id') id: string, @Body() body: CreateReportingPageDto) {
        return this.companiesService.addReportingPageToCompany(id, body);
    }

    // update reporting page    
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':id/reporting-page')
    async updateReportingPage(@Param('id') id: string, @Body() body: ReportingPageDto) {
        return this.companiesService.updateReportingPage(id, body);
    }
}
