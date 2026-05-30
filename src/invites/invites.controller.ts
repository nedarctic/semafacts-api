import { Controller, Post, Body, UseGuards, Query } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('invites')
export class InvitesController {
    constructor(private readonly invitesService: InvitesService){}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async createInvite(@Body('email') email: string, @Body('companyId') companyId: string) {
        await this.invitesService.createInvite(email, companyId);
        return { message: `Invite sent to ${email}` };
    }

    @Post('verify')
    async verifyInvite(@Query('token') token: string) {
        const userId = await this.invitesService.verifyInvite(token);
        return { message: 'Invite verified', userId };
    }
}
