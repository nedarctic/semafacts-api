import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationDto } from '../common/pagination.dto';
import { UserRole } from '../generated/prisma/enums';
import { CompaniesService } from './companies.service';
import { AddUsersDto } from './dto/add-users.dto';
import { ReportingPageDto as CreateReportingPageDto, ReportingPageDto } from './dto/reporting-page.dto';

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
    async getCompanyUsers(@Param('id') id: string) {
        return this.companiesService.getCompanyUsers(id);
    }

    // get company handlers
    @Get(':id/handlers')
    async getCompanyHandlers(@Param('id') id: string) {
        return await this.companiesService.getCompanyHandlers(id);
    }

    // get company incidents
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/incidents')
    async getCompanyIncidents(@Param('id') id: string) {
        return await this.companiesService.getCompanyIncidents(id);
    }

    // get total company users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-users')
    async getTotalCompanyUsers(@Param('id') id: string) {
        return await this.companiesService.getTotalCompanyUsers(id);
    }

    // get company total admins
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-admins')
    async getTotalCompanyAdmins(@Param('id') id: string) {
        return await this.companiesService.getTotalCompanyAdmins(id);
    }

    // get company total handlers
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-handlers')
    async getTotalCompanyHandlers(@Param('id') id: string) {
        return await this.companiesService.getTotalCompanyHandlers(id);
    }

    // get company total invited users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-invited-users')
    async getTotalCompanyInvitedUsers (@Param('id') id: string) {
        return await this.companiesService.getTotalCompanyInvitedUsers(id);
    }

    // get company total active users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-active-users')
    async getTotalCompanyActiveUsers (@Param('id') id: string) {
        return await this.companiesService.getTotalCompanyActiveUsers(id);
    }

    // get company total inactive users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':id/total-inactive-users')
    async getTotalCompanyInactiveUsers (@Param('id') id: string) {
        return await this.companiesService.getTotalCompanyInactiveUsers(id);
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

    // create new company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    async createCompany(@Body() dto: { name: string }) {
        return this.companiesService.createCompany(dto.name);
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
    async addCategoriesToCompany(@Param('id') id: string, @Body() dto: { categoryName: string }) {
        return this.companiesService.addCategoryToCompany(id, dto.categoryName);
    }

    // update company details
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('image'))
    @Patch(':id')
    async updateCompany(@UploadedFile() image: Express.Multer.File, @Param('id') id: string, @Body() dto: { name?: string, reportingLinkSlug?: string, slaDays?: string }) {
        return this.companiesService.updateCompany(id, image, dto);
    }

    // add reporting page to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':id/reporting-page')
    async addReportingPageToCompany(@Param('id') id: string, @Body() body: CreateReportingPageDto) {
        return this.companiesService.addReportingPageToCompany(id, body);
    }

    // update company category name
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':id/categories/:categoryId')
    async updateCompanyCategory(@Param('id') id: string, @Param('categoryId') categoryId: string, @Body() body: { categoryName: string }) {
        return this.companiesService.updateCompanyCategory(id, categoryId, body.categoryName);
    }

    // update reporting page    
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':id/reporting-page')
    async updateReportingPage(@Param('id') id: string, @Body() body: ReportingPageDto) {
        return this.companiesService.updateReportingPage(id, body);
    }

    // delete category from company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Delete(':id/categories/:categoryId')
    async deleteCategoryFromCompany(@Param('id') id: string, @Param('categoryId') categoryId: string) {
        return this.companiesService.deleteCategoryFromCompany(id, categoryId);
    }
}
