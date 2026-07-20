import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { EmailModule } from './email/email.module';
import { IncidentsModule } from './incidents/incidents.module';
import { InvitesModule } from './invites/invites.module';
import { PrismaModule } from './prisma/prisma.module';
import { R2Module } from './r2/r2.module';
import { UsersModule } from './users/users.module';
import { SecretCodeModule } from './secret-code/secret-code.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HandlersModule } from './handlers/handlers.module';
import { MessagesModule } from './messages/messages.module';
import { IncidentAuthModule } from './incident-auth/incident-auth.module';

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
    R2Module,
    SecretCodeModule,
    AuditLogModule,
    HandlersModule,
    MessagesModule,
    IncidentAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
