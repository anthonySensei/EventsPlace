import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthComponent} from './login/auth.component';
import {RegistrationComponent} from './registration/registration.component';


const routes: Routes = [
  { path: 'login', component:  AuthComponent},
  { path: 'registration', component:  RegistrationComponent}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
