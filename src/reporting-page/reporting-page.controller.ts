import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ReportingPageService } from './reporting-page.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@UseGuards(JwtAuthGuard)
@Controller('reporting-page')
export class ReportingPageController {
    constructor(
        private readonly reportingPageService: ReportingPageService
    ){}

    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Patch(":companyId")
    async updateReportingPage (
        @Param("companyId") companyId: string,
        @Body() dto: {
        title?: string; 
        reportingPageUrl?: string;
        policyUrl?: string;
        introContent?: string;
    }
    ) {
        return await this.reportingPageService.updateReportingPage(companyId, dto);
    }
}
