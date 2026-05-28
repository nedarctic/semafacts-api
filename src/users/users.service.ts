import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserNotFoundException } from './exceptions/user-not-found.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async createUser(dto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        dto.password = hashedPassword;
        return await this.prisma.user.create({ data: { ...dto } })
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async deactivateUser(id: string) {
        return await this.prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } })
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async getUsers() {
        return await this.prisma.user.findMany();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async updateUser(id: string, dto: UpdateUserDto) {
        try {
            const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;
            if (hashedPassword) {
                dto.password = hashedPassword;
            }
            return await this.prisma.user.update({
                where: { id },
                data: dto,
            });
        } catch (e) {
            throw new UserNotFoundException();
        }
    }
}
