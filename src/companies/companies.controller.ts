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
        return await this.companiesService.getCompanies(pagination);
    }

    // get company by id
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId')
    async getCompanyById(@Param('companyId') companyId: string) {
        return await this.companiesService.getCompanyById(companyId);
    }

    // get company users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/users')
    async getCompanyUsers(
        @Param('companyId') companyId: string,
        @Query() pagination: PaginationDto
    ) {
        return await this.companiesService.getCompanyUsers(companyId, pagination);
    }

    // get company handlers
    @Get(':companyId/handlers/')
    async getCompanyHandlers(
        @Param('companyId') companyId: string,
        @Query('incidentId') incidentId?: string
    ) {
        return await this.companiesService.getCompanyHandlers(companyId, incidentId);
    }

    // get company incidents
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/incidents')
    async getCompanyIncidents(
        @Param('companyId') companyId: string,
        @Query() pagination: PaginationDto
    ) {
        return await this.companiesService.getCompanyIncidents(companyId, pagination);
    }

    // get total company users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/total-users')
    async getTotalCompanyUsers(@Param('companyId') companyId: string) {
        return await this.companiesService.getTotalCompanyUsers(companyId);
    }

    // get company total admins
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/total-admins')
    async getTotalCompanyAdmins(@Param('companyId') companyId: string) {
        return await this.companiesService.getTotalCompanyAdmins(companyId);
    }

    // get company total handlers
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/total-handlers')
    async getTotalCompanyHandlers(@Param('companyId') companyId: string) {
        return await this.companiesService.getTotalCompanyHandlers(companyId);
    }

    // get company total invited users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/total-invited-users')
    async getTotalCompanyInvitedUsers(@Param('companyId') companyId: string) {
        return await this.companiesService.getTotalCompanyInvitedUsers(companyId);
    }

    // get company total active users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/total-active-users')
    async getTotalCompanyActiveUsers(@Param('companyId') companyId: string) {
        return await this.companiesService.getTotalCompanyActiveUsers(companyId);
    }

    // get company total inactive users
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/total-inactive-users')
    async getTotalCompanyInactiveUsers(@Param('companyId') companyId: string) {
        return await this.companiesService.getTotalCompanyInactiveUsers(companyId);
    }

    // get company total incidents
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/total-incidents')
    async getTotalCompanyIncidents(@Param('companyId') companyId: string) {
        return await this.companiesService.getTotalCompanyIncidents(companyId);
    }

    // get company audit logs
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/audit-logs')
    async getCompanyAuditLogs(@Param('companyId') companyId: string) {
        return await this.companiesService.getCompanyAuditLogs(companyId);
    }

    // get company categories
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/categories')
    async getCompanyCategories(@Param('companyId') companyId: string) {
        return await this.companiesService.getCompanyCategories(companyId);
    }

    // get company reporting page
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get(':companyId/reporting-page')
    async getCompanyReportingPage(@Param('companyId') companyId: string) {
        return await this.companiesService.getCompanyReportingPage(companyId);
    }

    // create new company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    async createCompany(@Body() dto: { name: string }) {
        return await this.companiesService.createCompany(dto.name);
    }

    // add users to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':companyId/users')
    async addUsersToCompany(@Param('companyId') companyId: string, @Body() body: AddUsersDto) {
        return await this.companiesService.addUsersToCompany(companyId, body);
    }

    // add categories to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':companyId/categories')
    async addCategoriesToCompany(@Param('companyId') companyId: string, @Body() dto: { categoryName: string }) {
        return await this.companiesService.addCategoryToCompany(companyId, dto.categoryName);
    }

    // send invitation email to handler
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Post(':companyId/invite')
    async inviteHandler(@Param('companyId') companyId: string, @Body() dto: { email: string }) { 
        this.logger.log(`Email received: ${dto.email}`);
        return await this.companiesService.sendInvitationEmail(dto.email, companyId);
    }

    // add reporting page to company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post(':companyId/reporting-page')
    async addReportingPageToCompany(@Param('companyId') companyId: string, @Body() body: CreateReportingPageDto) {
        return await this.companiesService.addReportingPageToCompany(companyId, body);
    }

    // update company details
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('logo'))
    @Patch(':companyId')
    async updateCompany(@UploadedFile() logo: Express.Multer.File, @Param('companyId') companyId: string, @Body() dto: { name?: string, slaDays?: string }) {
        return await this.companiesService.updateCompany(companyId, logo, dto);
    }

    // update company category name
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':companyId/categories/:categoryId')
    async updateCompanyCategory(@Param('companyId') companyId: string, @Param('categoryId') categoryId: string, @Body() body: { categoryName: string }) {
        return await this.companiesService.updateCompanyCategory(companyId, categoryId, body.categoryName);
    }

    // update reporting page    
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Patch(':companyId/reporting-page')
    async updateReportingPage(@Param('companyId') companyId: string, @Body() body: ReportingPageDto) {
        return this.companiesService.updateReportingPage(companyId, body);
    }

    // delete category from company
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Delete(':companyId/categories/:categoryId')
    async deleteCategoryFromCompany(@Param('companyId') companyId: string, @Param('categoryId') categoryId: string) {
        return await this.companiesService.deleteCategoryFromCompany(companyId, categoryId);
    }
}
