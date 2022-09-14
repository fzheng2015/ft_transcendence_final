import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsLoggedInGuard } from './auth/isLoggedIn.guard';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { GameComponent } from './game/game.component';
import { LobbyComponent } from './lobby/lobby.component';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { LoginSuccessComponent } from './login-register/login-success.component';
import { TfaLoginComponent } from './login-register/tfa-login/tfa-login.component';
import { NotfoundComponent } from './notfound/notfound.component';

// Website wide routing
// Child routing is delegated to modules: they need to call RouterModule.forChild(moduleRoutes) to register the routes

const routes: Routes = [
  {path: 'lobby', component: LobbyComponent, canActivate: [IsLoggedInGuard]},
	{path: 'game', component: GameComponent, canActivate: [IsLoggedInGuard]},
  {path: 'login', component: LoginRegisterComponent},
  {path: 'tfaLogin/:id', component: TfaLoginComponent},
  {path: 'login/success/:id', component: LoginSuccessComponent},
  {path: 'chatbox', component: ChatboxComponent, canActivate: [IsLoggedInGuard]},
  {path: '404', component: NotfoundComponent, canActivate: [IsLoggedInGuard]},
  {path: '', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
