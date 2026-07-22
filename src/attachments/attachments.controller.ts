import { Body, Controller, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AttachmentsValidationPipe } from '../incidents/dto/attachments-validation-pipe.dto';
import { AttachmentUploader } from '../generated/prisma/enums';

@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
    constructor(
        private readonly attachmentsService: AttachmentsService
    ) { }

    @UseInterceptors(FilesInterceptor("attachments"))
    @Post(":incidentId")
    async uploadAttachments(
        @Param("incidentId") incidentId: string,
        @UploadedFiles(new AttachmentsValidationPipe()) attachments: Express.Multer.File[],
        @Body() dto: {uploadedBy: AttachmentUploader}
    ) {
        return await this.attachmentsService.uploadNewAttachments(attachments, incidentId, dto.uploadedBy)
    }
}
