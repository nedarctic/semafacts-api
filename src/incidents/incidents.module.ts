import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SecretCodeModule } from '../secret-code/secret-code.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [PrismaModule, SecretCodeModule, AuditLogModule, R2Module],
  controllers: [IncidentsController],
  providers: [IncidentsService]
})
export class IncidentsModule {}
