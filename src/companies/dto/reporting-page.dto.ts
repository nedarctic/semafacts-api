import { IsOptional } from "class-validator";

export class ReportingPageDto {
  @IsOptional() 
  title?: string;

  @IsOptional() 
  introContent?: string;

  @IsOptional() 
  policyUrl?: string;

  @IsOptional() 
  reportingPageUrl?: string;
}