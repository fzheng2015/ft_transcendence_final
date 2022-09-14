import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MatchHistoryController } from './match-history.controller';
import { MatchEntity } from './match-history.entity';
import { MatchHistoryService } from './match-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity]), UserModule],
  exports: [MatchHistoryService],
  controllers: [MatchHistoryController],
  providers: [MatchHistoryService]
})

export class MatchHistoryModule {}
