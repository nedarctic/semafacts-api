import { IsEmail, MinLength } from "class-validator";

export class CreateUserDto {
    name!: String;

    @IsEmail()
    email!: String;

    @MinLength(6)
    password!: String;
}