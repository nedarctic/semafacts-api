import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(dto: CreateUserDto) {
        return await this.prisma.user.create({ data: { ...dto } })
    }

    async removeUser(id: string) {
        return await this.prisma.user.delete({ where: { id } })
    }

    async findUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getUsers() {
        return await this.prisma.user.findMany();
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        try {
            return await this.prisma.user.update({
                where: { id },
                data: dto,
            });
        } catch (e) {
            throw new NotFoundException('User not found');
        }
    }
}
