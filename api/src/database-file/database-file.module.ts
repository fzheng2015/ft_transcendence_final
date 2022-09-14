import { Module } from '@nestjs/common';
import { DatabaseFileService } from './database-file.service';
import { DatabaseFileController } from './database-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseFile } from './entities/database-file.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DatabaseFile]),
  ],
  controllers: [DatabaseFileController],
  providers: [DatabaseFileService]
})
export class DatabaseFileModule {}
