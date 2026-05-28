import { Controller, Post, Body, Request, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { type Response, type Request as ExpressRequest } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly configService: ConfigService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) res: Response) {
        const { access_token, refresh_token } = await this.authService.login(req.user);
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: this.configService.get('node_env') === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { access_token };
    }

    @UseGuards(JwtAuthGuard)
    @Post('refresh')
    async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }
        const { access_token, refresh_token: newRefreshToken } = await this.authService.refreshToken(refreshToken);
        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: this.configService.get('node_env') === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { access_token };
    }
 }
