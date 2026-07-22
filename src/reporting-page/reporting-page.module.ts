import { Module } from '@nestjs/common';
import { ReportingPageService } from './reporting-page.service';
import { ReportingPageController } from './reporting-page.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReportingPageService],
  controllers: [ReportingPageController]
})
export class ReportingPageModule {}
