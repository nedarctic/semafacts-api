import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class AttachmentsValidationPipe
  implements PipeTransform<Express.Multer.File[] | undefined>
{
  private readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  private readonly ALLOWED_MIME_TYPES = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',

    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',

    // Video
    'video/mp4',
    'video/mpeg',
    'video/webm',
    'video/quicktime',

    // Documents
    'application/pdf',

    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Text
    'text/plain',
    'text/csv',
  ];

  transform(files?: Express.Multer.File[]) {
    // Optional attachments
    if (!files?.length) {
      return files;
    }

    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File "${file.originalname}" exceeds the maximum size of 20 MB.`,
        );
      }

      if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `File "${file.originalname}" has an unsupported file type.`,
        );
      }
    }

    return files;
  }
}