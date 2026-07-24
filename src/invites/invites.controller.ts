import { Controller, Post, Body, UseGuards, Query, Param, Logger } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('invites')
export class InvitesController {
    private readonly logger = new Logger(InvitesController.name)
    constructor(private readonly invitesService: InvitesService) { }

    // create invite
    @Post("create/:companyId")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async createInvite(
        @Body() dto: { email: string },
        @Param('companyId') companyId: string
    ) {
        console.log("email at the controller", dto.email)
        await this.invitesService.createInvite(dto.email, companyId);
        return { message: `Invite sent to ${dto.email}` };
    }

    // verify invite
    @Post('verify')
    async verifyInvite(
        @Query('token') token: string,
        @Body() dto: { password: string }
    ) {
        const userId = await this.invitesService.verifyInvite(token, dto);
        return { message: 'Invite verified', userId };
    }
}
