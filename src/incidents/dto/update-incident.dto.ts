import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AttachmentUploader, IncidentStatus, ReporterType } from "../../generated/prisma/enums";

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

    @IsString()
    @IsOptional()
    @Transform(({ value }) => (new Date(value)))
    @IsDate()
    incidentDate?: string;

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    reporterType!: ReporterType;

    @IsOptional()
    @IsString()
    status?: IncidentStatus;

    @IsString()
    @IsOptional()
    deadlineAt?: string;

    @IsString()
    @IsOptional()
    closedAt?: string;

    @IsString()
    @IsOptional()
    duration?: string;

    @IsString()
    @IsOptional()
    uploadedBy!: AttachmentUploader;

}