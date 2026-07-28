import { Controller, Body, Post, Get, Delete, Param, Patch, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';
import { PaginationDto } from '../common/pagination.dto';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // get users
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Get()
    getUsers(@Query() pagination: PaginationDto) {
        return this.usersService.getUsers(pagination);
    }

    // get user by id
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HANDLER)
    @Get(':userId')
    getUserById(@Param('userId', new ParseUUIDPipe()) userId: string) {
        return this.usersService.getUserById(userId);
    }

    // create user
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Post()
    createUser(@Body() body: CreateUserDto) {
        return this.usersService.createUser(body);
    }

    // update user
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HANDLER)
    @Patch(':id')
    updateUser(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateUserDto) {
        return this.usersService.updateUser(id, body);
    }

    // send password reset email
    @Post("password-reset")
    async sendPasswordResetEmail (
        @Body() dto: {email: string}
    ) {
        return await this.usersService.sendPasswordResetEmail(dto.email);
    }

    // delete user
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @Delete(':id')
    deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.usersService.deactivateUser(id);
    }
}
