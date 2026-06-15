import { Module } from '@nestjs/common';
import { HandlersService } from './handlers.service';
import { HandlersController } from './handlers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [HandlersService],
  controllers: [HandlersController]
})
export class HandlersModule {}
