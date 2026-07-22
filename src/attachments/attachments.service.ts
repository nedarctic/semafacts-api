import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { IncidentNotFoundException } from '../incidents/exceptions/incident-not-found.exception';
import { AttachmentUploader } from '../generated/prisma/enums';

@Injectable()
export class AttachmentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly r2: R2Service
    ) { }

    // upload new attachments
    async uploadNewAttachments(attachments: Express.Multer.File[], incidentId: string, uploadedBy: AttachmentUploader) {
        const incident = await this.prisma.incident.findUnique({
            where: {
                id: incidentId
            }
        });

        if (!incident) {
            throw new IncidentNotFoundException(incidentId);
        }

        const attachmentsData = await Promise.all(
            attachments.map(async (attachment) => {
            const { key, publicUrl } = attachment.size > 0 ? await this.r2.uploadFile(attachment, "evidences") : {};
            const attachmentData = {
                incidentId,
                fileKey: key,
                fileUrl: publicUrl,
                uploadedBy,
                mimetype: attachment.mimetype
            } as {
                incidentId: string;
                fileKey: string;
                fileUrl: string;
                uploadedBy: AttachmentUploader;
                mimetype: string;
            };
            return attachmentData;
        })
        )

        // create new attachments
        return await this.prisma.attachment.createMany({
            data: attachmentsData
        })
    }
}
