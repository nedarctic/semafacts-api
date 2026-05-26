import { Controller, Body, Post, Get, Delete, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Post()
    createUser(@Body() body: CreateUserDto){
        return this.usersService.createUser(body);
    }

    @Get()
    getUsers(){
        return this.usersService.getUsers();
    }

    @Get(':id')
    getUser(@Param('id') id: string){
        return this.usersService.findUser(id);
    }

    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto){
        return this.usersService.updateUser(id, body);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string){
        return this.usersService.removeUser(id);
    }
}
