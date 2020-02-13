import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';

import {SharedModule} from '../shared/shared.module';

import {RegistrationComponent} from './registration/registration.component';
import {AuthComponent} from './login/auth.component';
import {AuthRoutingModule} from './auth-routing.module';
import {FormsModule} from '@angular/forms';



@NgModule({
  declarations: [
    AuthComponent,
    RegistrationComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    AuthRoutingModule,
    FormsModule
  ]
})
export class AuthModule { }
