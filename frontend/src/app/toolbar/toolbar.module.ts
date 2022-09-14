import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { ToolbarComponent } from './toolbar.component';

@NgModule({
  declarations: [
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    ToolbarComponent
  ]
})
export class ToolbarModule { }
