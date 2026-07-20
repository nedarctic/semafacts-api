import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IncidentAuthService } from '../incident-auth.service';

@Injectable()
export class IncidentLocalStrategy extends PassportStrategy(Strategy, "incident-local") {
    constructor(private authService: IncidentAuthService) {
        super({ usernameField: "code", passwordField: "secretCode" });
    }

    async validate(code: string, secretCode: string): Promise<any> {
        const incident = await this.authService.validateReporter(code, secretCode);
        if (!incident) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return incident;
    }
}