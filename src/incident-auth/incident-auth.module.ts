import { Module } from '@nestjs/common';
import { IncidentAuthController } from './incident-auth.controller';
import { IncidentAuthService } from './incident-auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IncidentJwtStrategy } from './strategy/incident-jwt.strategy';
import { IncidentLocalStrategy } from './strategy/incident-local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecretCodeModule } from '../secret-code/secret-code.module';

@Module({
  imports: [
    PrismaModule,
    SecretCodeModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')
      })
    })
  ],
  controllers: [IncidentAuthController],
  providers: [IncidentAuthService, IncidentJwtStrategy, IncidentLocalStrategy]
})
export class IncidentAuthModule { }
