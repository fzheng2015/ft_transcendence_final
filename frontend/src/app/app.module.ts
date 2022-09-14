import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'http://localhost:3000/', options: {} };

// Here we put our own modules
import { MaterialModule } from './material/material.module';
import { ToolbarModule } from './toolbar/toolbar.module';
import { UserModule } from './user/user.module';
import { LoginRegisterModule } from './login-register/login-register.module';
import { httpInterceptorProviders } from './http-interceptors';
import { NotfoundModule } from './notfound/notfound.module';
import { NotificationModule } from './notification/notification.module';
import { ChatboxModule } from './chatbox/chatbox.module';
import { MatchHistoryModule } from './match-history/match-history.module';
import { GameModule } from './game/game.module';
import { LobbyModule } from './lobby/lobby.module';
import { LadderListComponent } from './ladder-list/ladder-list.component';


@NgModule({
  declarations: [
    AppComponent,
    LadderListComponent
  ],
  imports: [
    BrowserModule,
	  SocketIoModule.forRoot(config),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    // Here we import our own modules
    MaterialModule,
    ToolbarModule,
    LoginRegisterModule,
    UserModule,
    ChatboxModule,
    NotfoundModule,
    NotificationModule,
  	FormsModule,
	  ReactiveFormsModule,
    MatchHistoryModule,
    FormsModule,
    GameModule,
    LobbyModule
  ],
  providers: [httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
