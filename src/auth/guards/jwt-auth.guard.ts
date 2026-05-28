import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: any) {

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException({ error: 'NO_TOKEN', message: 'Access token missing or malformed' });
        }
        if (info?.name === 'TokenExpiredError') {
            throw new UnauthorizedException({ error: 'TOKEN_EXPIRED', message: 'Access token expired' });
        }
        if (err || info || !user) {
            throw err || new UnauthorizedException({ error: 'INVALID_TOKEN', message: 'Access token invalid' });
        }
        return user;
    }
}