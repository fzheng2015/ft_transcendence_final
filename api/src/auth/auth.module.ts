import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/user/entities/user.entity';
import { FortyTwoStrategy } from './42.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { TfaController } from './tfa/tfa.controller';
import { TfaService } from './tfa/tfa.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_ACCESS_EXPI_TIME')}`,
        },
      }),
    }),
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [
    AuthController,
    TfaController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    FortyTwoStrategy,
    TfaService
  ],
  exports: [AuthService],
})

export class AuthModule { }