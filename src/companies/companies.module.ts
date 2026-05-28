import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  imports: [PrismaModule]
})
export class CompaniesModule {}
