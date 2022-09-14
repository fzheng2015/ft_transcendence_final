import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ChatboxComponent } from './chatbox.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketChat } from './chat.socket';
import { NotificationModule } from '../notification/notification.module';


@NgModule({
  declarations: [ChatboxComponent],
  imports: [
    CommonModule,
	FormsModule,
	ReactiveFormsModule,
	MaterialModule,
  NotificationModule,
  ],
  exports: [
	ChatboxComponent
  ],
  providers: [SocketChat]
})
export class ChatboxModule { }
