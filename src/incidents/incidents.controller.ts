import { Controller, Post, Get, Body, Param, Query, UploadedFiles, UseInterceptors, Patch } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { PaginationDto } from '../common/pagination.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AttachmentsValidationPipe } from './dto/attachments-validation-pipe.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService){}

    @Get()
    async getIncidents(@Query() pagination: PaginationDto){
        return await this.incidentsService.getIncidents(pagination);
    }

    @Post(':companyId')
    @UseInterceptors(FilesInterceptor('attachments'))
    async createIncident(
        @Param('companyId') companyId: string,
        @Body() dto: CreateIncidentDto,
        @UploadedFiles(new AttachmentsValidationPipe()) attachments: Express.Multer.File[]
    ){
        return await this.incidentsService.createIncident(companyId, attachments, dto);
    }

    @Get(':incidentId')
    async getIncident(@Param('incidentId') incidentId: string){
        return await this.incidentsService.getIncident(incidentId);
    }

    @Patch(':incidentId')
    @UseInterceptors(FilesInterceptor('attachments'))
    async updateIncident(
        @Param('incidentId') incidentId: string, 
        @Body() dto: UpdateIncidentDto, 
        @UploadedFiles(new AttachmentsValidationPipe()) attachments: Express.Multer.File[]
    ){
        return await this.incidentsService.updateIncident(incidentId, attachments, dto);
    }
}
