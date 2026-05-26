import { IsEmail, IsString, MinLength, IsOptional, IsUUID, IsEnum } from "class-validator";
import { UserRole, UserStatus } from "../../generated/prisma/enums";

export class CreateUserDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsUUID()
    companyId?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
}