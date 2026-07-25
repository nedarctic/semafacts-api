import { Module } from '@nestjs/common';
import { HandlersService } from './handlers.service';
import { HandlersController } from './handlers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuditLogModule, EmailModule, ConfigModule],
  providers: [HandlersService],
  controllers: [HandlersController]
})
export class HandlersModule {}
