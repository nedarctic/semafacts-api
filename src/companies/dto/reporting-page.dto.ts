import { IsOptional, IsString } from "class-validator";

export class ReportingPageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  introContent?: string;

  @IsOptional()
  @IsString()
  policyUrl?: string;

  @IsOptional()
  @IsString()
  reportingPageUrl?: string;
}