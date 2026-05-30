import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { InvitesController } from './invites.controller';

@Module({
  providers: [InvitesService],
  imports: [PrismaModule, EmailModule, ConfigModule, UsersModule],
  controllers: [InvitesController]
})
export class InvitesModule {}
