import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
