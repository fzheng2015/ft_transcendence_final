import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotfoundComponent } from './notfound.component';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [
    NotfoundComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    NotfoundComponent
  ]
})
export class NotfoundModule { }
