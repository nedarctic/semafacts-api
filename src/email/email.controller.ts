import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
    constructor(private emailService: EmailService) {}

    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @Post()    
    async sendEmail(@Body() body: { to: string; subject: string; html: string }) {
        return await this.emailService.sendEmail(body.to, body.subject, body.html);
    }
}
