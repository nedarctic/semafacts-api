import { Controller, Get, Param, Patch, Post, Logger } from '@nestjs/common';
import { HandlersService } from './handlers.service';

@Controller('handlers')
export class HandlersController {
    private readonly logger = new Logger(HandlersController.name)
    constructor(private readonly handlersService: HandlersService) { }

    // get handler incidents
    @Get(':handlerId/incidents')
    async getHandlerIncidents(@Param('handlerId') handlerId: string) {
        return this.handlersService.getHandlerIncidents(handlerId);
    }

    // get handler details
    @Get(':handlerId')
    async getHandlerDetails(@Param('handlerId') handlerId: string){
        return this.handlersService.getHandlerDetails(handlerId);
    }

    // assign a handler to an incident
    @Patch(':handlerId/incidents/:incidentId')
    async assignHandler(
        @Param('handlerId') handlerId: string,
        @Param('incidentId') incidentId: string,
    ) {
        this.logger.log(`Incident ID: ${incidentId}, handler ID: ${handlerId}`)
        return await this.handlersService.assignHandler(handlerId, incidentId)
    }
}
