import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';

import { GameComponent } from './game.component';
import { SocketPong } from './game.socket';
import { SocketIoModule } from 'ngx-socket-io';
import { GameService } from './game.service';
import { UserModule } from '../user/user.module';
import { GameEndComponent } from './game-end.component';


@NgModule({
  declarations: [GameComponent, GameEndComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SocketIoModule,
    UserModule
  ],
  exports: [
    GameComponent
  ],
  providers: [SocketPong]
})
export class GameModule { }
