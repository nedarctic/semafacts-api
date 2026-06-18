import { Controller, Post, Get, Body, Param, Query, UploadedFiles, UseInterceptors, Patch, Delete, Logger } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { PaginationDto } from '../common/pagination.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AttachmentsValidationPipe } from './dto/attachments-validation-pipe.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Controller('incidents')
export class IncidentsController {
    private readonly logger = new Logger(IncidentsController.name)
    constructor(private readonly incidentsService: IncidentsService) { }

    // get paginated incidents
    @Get()
    async getIncidents(@Query() pagination: PaginationDto) {
        return await this.incidentsService.getIncidents(pagination);
    }

    // get incident 
    @Get(':incidentId')
    async getIncident(@Param('incidentId') incidentId: string) {
        return await this.incidentsService.getIncident(incidentId);
    }

    //get incident handlers
    @Get(':incidentId/handlers')
    async getIncidentHandlers(
        @Param('incidentId') incidentId: string
    ) {
        return await this.incidentsService.getCompanyIncidentHandlers(incidentId)
    }

    // create new incident
    @Post(':companyId')
    @UseInterceptors(FilesInterceptor('attachments'))
    async createIncident(
        @Param('companyId') companyId: string,
        @Body() dto: CreateIncidentDto,
        @UploadedFiles(new AttachmentsValidationPipe()) attachments: Express.Multer.File[]
    ) {
        return await this.incidentsService.createIncident(companyId, attachments, dto);
    }

    // update incident
    @Patch(':incidentId')
    @UseInterceptors(FilesInterceptor('attachments'))
    async updateIncident(
        @Param('incidentId') incidentId: string,
        @Body() dto: UpdateIncidentDto,
        @UploadedFiles(new AttachmentsValidationPipe()) attachments?: Express.Multer.File[]
    ) {
        const {uploadedBy, ...incidentDto} = dto;
        return await this.incidentsService.updateIncident(incidentId, incidentDto, attachments, uploadedBy);
    }

    // delete an incident
    @Delete(':incidentId')
    async deleteIncident(@Param('incidentId') incidentId: string) {
        return await this.incidentsService.deleteIncident(incidentId);
    }

}
