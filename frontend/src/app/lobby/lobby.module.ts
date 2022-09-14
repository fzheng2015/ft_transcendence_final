import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyComponent } from './lobby.component';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    LobbyComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [LobbyComponent]
})
export class LobbyModule { }
