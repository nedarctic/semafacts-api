import { Controller, Post, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SenderType } from '../generated/prisma/enums';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post(':incidentId')
    async createMessage(@Param('incidentId') incidentId: string, @Body() dto: { content: string, senderType: SenderType }) {
        return this.messagesService.createMessage(incidentId, dto.content, dto.senderType);
    }
}
