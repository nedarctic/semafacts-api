import { Controller, Body, Post, Get, Delete, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    createUser(@Body() body: CreateUserDto) {
        return this.usersService.createUser(body);
    }

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }

    @Get(':id')
    getUser(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.usersService.getUserById(id);
    }

    @Patch(':id')
    updateUser(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateUserDto) {
        return this.usersService.updateUser(id, body);
    }

    @Delete(':id')
    deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.usersService.removeUser(id);
    }
}
