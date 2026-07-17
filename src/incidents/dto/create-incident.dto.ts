import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ReporterType } from "../../generated/prisma/enums";

export class CreateIncidentDto {

  @IsString()
  category!: string;

  @IsString()
  description!: string;

  @IsString()
  location!: string;

  @IsString()
  involvedPeople!: string;

  @IsString()
  duration!: string;

  @IsString()
  incidentDate!: string;

  @IsNotEmpty()
  @IsString()
  reporterType!: ReporterType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  slaDays?: string;
}