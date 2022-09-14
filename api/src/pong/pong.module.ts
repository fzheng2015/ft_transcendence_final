import { Module } from '@nestjs/common';
import { PongService } from './pong.service';
import { PongController } from './pong.controller';
import { UserModule } from 'src/user/user.module';
import { MatchHistoryModule } from 'src/match-history/match-history.module';
import { MessageModule } from 'src/message/message.module';

@Module({
    providers: [PongService],
    imports: [UserModule, MatchHistoryModule, MessageModule],
    exports: [PongService],
    controllers: [PongController]
})
export class PongModule {
}
