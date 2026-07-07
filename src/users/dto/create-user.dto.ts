import { IsEmail, IsString, MinLength, IsOptional, IsUUID, IsEnum, IsNotEmpty } from "class-validator";
import { UserRole, UserStatus } from "../../generated/prisma/enums";

export class CreateUserDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @MinLength(6)
    password!: string;

    @IsUUID()
    @IsNotEmpty()
    companyId!: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}