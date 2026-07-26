import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SenderType } from '../generated/prisma/enums';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get(":incidentId")
    async getIncidentMessages(@Param("incidentId") incidentId: string) {
        return await this.messagesService.getIncidentMessages(incidentId);
    }

    @Post(':incidentId')
    async createMessage(@Param('incidentId') incidentId: string, @Body() dto: {
        content: string,
        senderType: SenderType,
        handlerId?: string,

    }) {
        return await this.messagesService.createMessage(
            incidentId,
            dto.content,
            dto.senderType,
            dto.handlerId
        );
    }
}
