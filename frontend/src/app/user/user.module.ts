import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 
import { MaterialModule } from '../material/material.module';
import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserComponent } from './user.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component';
import { FormsModule } from '@angular/forms';
import {MatDialogModule } from '@angular/material/dialog';

// This module should contain all components related to users

@NgModule({
  declarations: [
    UserListComponent,
    UserProfileComponent,
    UserComponent,
    UserProfileEditComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    UserRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    ],
  exports: [
    UserListComponent,
    UserProfileComponent
  ]
})
export class UserModule { }
