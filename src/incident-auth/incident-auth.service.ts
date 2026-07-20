import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Incident } from '../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { SecretCodeService } from '../secret-code/secret-code.service';

@Injectable()
export class IncidentAuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly secretCodeService: SecretCodeService,
    ) { }

    async validateReporter(code: string, secretCode: string) {

        console.log("VALIDATING REPORTER");
        console.log("CODE:", code);
        console.log("SECRET CODE:", secretCode);

        const incident = await this.prisma.incident.findUnique({
            where: {
                incidentIdDisplay: code,
            }
        });

        if (!incident) {
            return null;
        }

        const valid = await this.secretCodeService.verifySecret(secretCode, incident.secretCodeHash);

        if (!valid) {
            return null;
        }

        return incident;
    }

    async login(incident: Incident) {
        
        const payload = {
            sub: incident.id,
            companyId: incident.companyId,
        };

        const incidentData = await this.prisma.incident.findUnique({
            where: {
                id: payload.sub
            },
            include: {
                reporter: true
            }
        })

        if(!incidentData){
            throw new UnauthorizedException("Invalid credentials");
        }

        const user = {
            id: incidentData.reporter?.id,
            name: incidentData.reporter?.name,
            email: incidentData.reporter?.email,
            companyId: incidentData.companyId,
            role: "REPORTER"
        }

        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: "15m" });
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: "7d" });

        return { accessToken, refreshToken, user };
    }

    async refresh(refreshToken: string){
        try {
            const payload = await this.jwtService.verify(refreshToken);
            const incident = await this.prisma.incident.findUnique({where: {id: payload.sub}});

            if(!incident){
                throw new UnauthorizedException('Invalid token');
            }

            return this.login(incident);

        } catch (error) {
            throw error;
        }
    }
}
