import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AuthGuard} from './auth/auth.guard';

import { UserComponent } from './user/user.component';
import { UserDetailsComponent } from './user/user-details/user-details.component';




const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'my-account', component: UserComponent, canActivate: [AuthGuard] },
  { path: 'user/:id', component: UserDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
