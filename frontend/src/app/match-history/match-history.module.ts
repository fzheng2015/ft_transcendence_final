import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchHistoryComponent } from './match-history.component';
import { MaterialModule } from '../material/material.module';



@NgModule({
  declarations: [MatchHistoryComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [MatchHistoryComponent]
})
export class MatchHistoryModule { }
