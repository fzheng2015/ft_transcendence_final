import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../material/material.module';
import { LoginRegisterComponent } from './login-register.component';
import { LoginSuccessComponent } from './login-success.component';
import { TfaLoginComponent } from './tfa-login/tfa-login.component';
import { TfaQrCodeComponent } from './tfa-login/tfa-qr-code.component';
import { TfaCheckComponent } from './tfa-login/tfa-check.component';


@NgModule({
  declarations: [
    LoginRegisterComponent,
    LoginSuccessComponent,
    TfaLoginComponent,
    TfaQrCodeComponent,
    TfaCheckComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule
  ],
  exports: [
    LoginRegisterComponent
  ]
})
export class LoginRegisterModule { }
