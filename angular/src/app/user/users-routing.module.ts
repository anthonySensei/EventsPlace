import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthGuard} from '../auth/auth.guard';
import {AdminGuard} from './admin.guard';

import {UserComponent} from './user.component';
import {CreateUserComponent} from './create-user/create-user.component';

import {CanDeactivateGuard} from '../shared/can-deactivate-guard.service';


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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
