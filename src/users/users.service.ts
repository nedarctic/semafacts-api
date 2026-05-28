import { Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserNotFoundException } from './exceptions/user-not-found.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(dto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        dto.password = hashedPassword;
        return await this.prisma.user.create({ data: { ...dto } })
    }

    async deactivateUser(id: string) {
        return await this.prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } })
    }

    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    async getUsers() {
        return await this.prisma.user.findMany();
    }

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
