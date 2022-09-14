import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';

// This module imports/exports all the relevant material modules we need
// Then in other modules, we just need to import this one


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule
  ],
  exports: [
    FlexLayoutModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule
  ]
})
export class MaterialModule { }
