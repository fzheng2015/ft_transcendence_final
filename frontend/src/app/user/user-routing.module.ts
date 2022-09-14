import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IsLoggedInGuard } from '../auth/isLoggedIn.guard';
import { IsSelfGuard } from '../auth/isSelf.guard';
import { LadderListComponent } from '../ladder-list/ladder-list.component';
import { MatchHistoryComponent } from '../match-history/match-history.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserComponent } from './user.component';

const routes: Routes = [
  {path: 'user', component: UserComponent, canActivate: [IsLoggedInGuard], children: [
    {path: 'list', component: UserListComponent},
    {path: ':id/edit', component: UserProfileEditComponent, canActivate: [IsSelfGuard]},
    {path: ':id', component: UserProfileComponent},
    {path: ':id/history', component: MatchHistoryComponent},
    {path: ':id/ladderList', component: LadderListComponent},
    {path: '', redirectTo: 'list', pathMatch: 'full'}
  ]}
];

// This registers the routes to the main router module 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }