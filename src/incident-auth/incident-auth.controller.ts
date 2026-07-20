import { Body, Controller, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { IncidentLocalAuthGuard } from './guard/incident-local-auth.guard';
import { IncidentAuthService } from './incident-auth.service';

@Controller('incident-auth')
export class IncidentAuthController {
    private readonly logger = new Logger(IncidentAuthController.name);
    constructor(
        private readonly incidentAuthService: IncidentAuthService
    ) { }

    @UseGuards(IncidentLocalAuthGuard)
    @Post("login")
    async login(@Request() req: any) {

        this.logger.log("Running login...");

        this.logger.log("user", req.user);
        const incident = req.user;
        const {
            accessToken,
            refreshToken,
            user
        } = await this.incidentAuthService.login(incident);

        return { accessToken, refreshToken, user };
    }

    @Post("refresh")
    async refresh(@Body() dto: { refreshToken: string }) {
        const {
            accessToken,
            refreshToken,
            user
        } = await this.incidentAuthService.refresh(dto.refreshToken);
        return { accessToken, refreshToken, user }
    }
}
