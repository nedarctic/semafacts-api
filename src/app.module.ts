import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { EmailModule } from './email/email.module';
import { InvitesModule } from './invites/invites.module';
import { IncidentsModule } from './incidents/incidents.module';
import { R2Module } from './r2/r2.module';

@Module({
  imports: [
    UsersModule, 
    PrismaModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true
      }
    }),
    AuthModule,
    CompaniesModule,
    EmailModule,
    InvitesModule,
    IncidentsModule,
    R2Module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
