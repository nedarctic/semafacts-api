import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { Multer } from 'multer'
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {

    private client;

    constructor(private readonly configService: ConfigService) {
        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${this.configService.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY')!
            }
        } as any)
    }

    async uploadFile(file: Express.Multer.File, category: string) {
        const key = `${category}/${Date.now()}-${file.originalname}`;
        const publicUrl = this.getPublicUrl(key);

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            })
        )

        return { key, publicUrl };
    }

    getPublicUrl(key: string) {
        return `${this.configService.get<string>('R2_PUBLIC_URL')}/${key}`;
    }

    async deleteFile(key: string) {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
                Key: key,
            }),
        );
    }
}