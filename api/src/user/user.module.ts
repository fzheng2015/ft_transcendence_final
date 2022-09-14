import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { DatabaseFileService } from 'src/database-file/database-file.service';
import { DatabaseFile } from 'src/database-file/entities/database-file.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([DatabaseFile]),
        forwardRef(() => AuthModule)
    ],
    controllers: [UserController],
    providers: [UserService, DatabaseFileService],
    exports: [UserService],
})
export class UserModule { }
