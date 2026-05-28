import { IsOptional } from "class-validator";

export class UpdateCompanyDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    reportingLinkSlug?: string;

    @IsOptional()
    slaDays?: string;
}