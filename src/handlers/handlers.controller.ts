import { Controller, Get, Param, Patch, Post, Logger, Delete, Proppatch, Body, Query } from '@nestjs/common';
import { HandlersService } from './handlers.service';
import { PaginationDto } from '../common/pagination.dto';

@Controller('handlers')
export class HandlersController {
    private readonly logger = new Logger(HandlersController.name)
    constructor(private readonly handlersService: HandlersService) { }

    // get handler incidents
    @Get(':handlerId/incidents')
    async getHandlerIncidents(
        @Param('handlerId') handlerId: string,
        @Query() pagination: PaginationDto
    ) {
        return this.handlersService.getHandlerIncidents(handlerId, pagination);
    }

    // get handler details
    @Get(':handlerId')
    async getHandlerDetails(@Param('handlerId') handlerId: string) {
        return this.handlersService.getHandlerDetails(handlerId);
    }

    // assign a handler to an incident
    @Patch(':handlerId/incidents/:incidentId/assign')
    async assignHandler(
        @Param('handlerId') handlerId: string,
        @Param('incidentId') incidentId: string,
        @Body() dto: { email: string }
    ) {
        this.logger.log(`Incident ID: ${incidentId}, handler ID: ${handlerId}, email: ${dto.email}`)
        return await this.handlersService.assignHandler(handlerId, incidentId, dto.email)
    }

    // assign handlers to an incident
    @Patch('incidents/:incidentId/assign')
    async assignHandlers(
        @Param('incidentId') incidentId: string,
        @Body() body: { handlersIds: string[] }
    ) {
        this.logger.log(`HANDLERS IDS RECEIVED`, body.handlersIds);
        return await this.handlersService.assignHandlers(incidentId, body.handlersIds)
    }

    // remove a handler from an incident
    @Delete(':handlerId/incidents/:incidentId/deassign')
    async deassignHandler(
        @Param('handlerId') handlerId: string,
        @Param('incidentId') incidentId: string,
    ) {
        return await this.handlersService.deassignHandler(handlerId, incidentId);
    }

}
