import { Body, Controller, Logger, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {

    private readonly logger = new Logger();
    constructor(
        private authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req: any) {
        const user = req.user;
        const { access_token, refresh_token } = await this.authService.login(user);

        return { user, access_token, refresh_token };
    }

    @Post('refresh')
    async refresh(@Body() dto: { refreshToken: string }) {
        if (!dto.refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }
        const { access_token, refresh_token } = await this.authService.refreshToken(dto.refreshToken);
        return { access_token, refresh_token };
    }
}
