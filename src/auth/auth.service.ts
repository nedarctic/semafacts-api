import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ){}

    async validateUser(email: string, pass: string){
        const user = await this.usersService.getUserByEmail(email);
        const isMatch = await bcrypt.compare(pass, user.password);

        if (!user || !isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const {refreshToken, password, createdAt, updatedAt, ...rest } = user;
        
        return rest;
    }

    async login(user: any){
        const payload = { 
            email: user.email, 
            id: user.id, 
            role: user.role, 
            name: user.name, 
            status: user.status, 
            companyId: user.companyId 
        };

        const access_token: string = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refresh_token: string = this.jwtService.sign(payload, { expiresIn: '7d' });

        await this.usersService.updateUser(user.id, { refreshToken: await bcrypt.hash(refresh_token, 10) });

        return {
            access_token,
            refresh_token
        };
    }

    async refreshToken(token: string){
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.getUserById(payload.id);

            if (!user || !user.refreshToken || !(await bcrypt.compare(token, user.refreshToken))) {
                throw new UnauthorizedException('Invalid token');
            }

            return this.login(user);
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
