import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { HandlersService } from './handlers.service';

@Controller('handlers')
export class HandlersController {
    constructor(private readonly handlersService: HandlersService) { }

    // get handler incidents
    @Get(':handlerId/incidents')
    async getHandlerIncidents(@Param('handlerId') handlerId: string) {
        return this.handlersService.getHandlerIncidents(handlerId);
    }

    // assign a handler to an incident
    @Patch(':handlerId/incidents/:incidentId')
    async assignHandler(
        @Param('handlerId') handlerId: string,
        @Param('incidentId') incidentId: string,
    ) {
        return await this.handlersService.assignHandler(handlerId, incidentId)
    }
}
