import { Transform, Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AttachmentUploader, IncidentStatus, ReporterType } from "../../generated/prisma/enums";

export const EmptyToUndefined = Transform(({value}) => value === "" ? undefined : value);

export class UpdateIncidentDto {

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    involvedPeople?: string;

    @IsOptional()
    @IsString()
    incidentDate?: string;

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    reporterType!: ReporterType;

    @IsOptional()
    @IsString()
    status?: IncidentStatus;
    
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    deadlineAt?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    closedAt?: string;

    @IsString()
    @IsOptional()
    duration?: string;

    @IsString()
    @IsOptional()
    uploadedBy?: AttachmentUploader;

}