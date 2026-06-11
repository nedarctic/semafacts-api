import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { R2Module } from '../r2/r2.module';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  imports: [PrismaModule, R2Module]
})
export class CompaniesModule { }
