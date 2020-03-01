import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AuthGuard} from '../auth/auth.guard';
import {AdminGuard} from './admin.guard';

import {UserComponent} from './user.component';
import {CreateUserComponent} from './create-user/create-user.component';
import {UsersComponent} from './users/users.component';
import {UserDetailsComponent} from './user-details/user-details.component';

import {CanDeactivateGuard} from '../shared/can-deactivate-guard.service';
import {ManagerGuard} from './manager.guard';


const routes: Routes = [
  {
    path: 'my-account',
    canDeactivate: [CanDeactivateGuard],
    component: UserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'create-user',
    canDeactivate: [CanDeactivateGuard],
    component: CreateUserComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard, ManagerGuard] },
  { path: 'user/:id', component: UserDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
