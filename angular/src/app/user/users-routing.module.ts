import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AuthGuard} from '../auth/auth.guard';

import {UserComponent} from './user.component';
import {CreateUserComponent} from './create-user/create-user.component';
import {UsersComponent} from './users/users.component';
import {UserDetailsComponent} from './user-details/user-details.component';


const routes: Routes = [
  { path: 'my-account', component: UserComponent, canActivate: [AuthGuard] },
  { path: 'create-user', component: CreateUserComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'user/:id', component: UserDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
