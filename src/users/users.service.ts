import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/pagination.dto';
import { UserRole, UserStatus } from '../generated/prisma/enums';
import { UserWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user-not-found.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger();
    constructor(private readonly prisma: PrismaService
    ) { }

    // get user by id
    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                incidentHandlers: {
                    include: {
                        incident: true
                    }
                }
            }
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    // get user by email
    async getUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UserNotFoundException();
        }

        return user;
    }

    // get users
    async getUsers(pagination: PaginationDto) {

        const {
            page = 1,
            limit = 10,
            search
        } = pagination;


        const skip = (page - 1) * limit;

        const searchUpper = search?.trim().toUpperCase();

        const roleMatch = Object.values(UserRole)
            .includes(searchUpper as UserRole) ?
            (searchUpper as UserRole) :
            undefined;

        const statusMatch = Object.values(UserStatus)
            .includes(searchUpper as UserStatus) ?
            (searchUpper as UserStatus) :
            undefined;

        const where: UserWhereInput = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        company: {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    },

                    ...(roleMatch
                        ? [
                            {
                                role: roleMatch,
                            },
                        ]
                        : []),

                    ...(statusMatch
                        ? [
                            {
                                status: statusMatch,
                            },
                        ]
                        : []),
                ],
            }
            : {};

        const [usersData, total] = await Promise.all([
            await this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    company: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            await this.prisma.user.count({
                where
            })
        ])

        const users = usersData.map(({ company, ...user }) => ({
            ...user,
            companyName: company?.name
        }))

        return {
            users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    // create a user
    async createUser(dto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        dto.password = hashedPassword;
        return await this.prisma.user.create({ data: { ...dto } })
    }

    // update a user
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

    // deactivate a user
    async deactivateUser(id: string) {
        return await this.prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } })
    }
}
