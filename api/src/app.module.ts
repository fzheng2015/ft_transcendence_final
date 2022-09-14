import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseFileModule } from './database-file/database-file.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MatchHistoryModule } from './match-history/match-history.module';
import * as Joi from 'joi';
import { ChatboxGateway } from './chatbox.gateway';
import { MessageModule } from './message/message.module'
import { ConversationModule } from './conversation/conversation.module';
import { PongModule } from './pong/pong.module';
import { PongGateway } from './pong.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPI_TIME: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPI_TIME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot(
      {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: true,
        entities: ["dist/**/*.entity{.ts,.js}"]
      }
    ),
    UserModule,
    MessageModule,
    ConversationModule,
    AuthModule,
    DatabaseFileModule,
    ConversationModule,
    PongModule,
    MatchHistoryModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatboxGateway, PongGateway],
})

export class AppModule {
}
