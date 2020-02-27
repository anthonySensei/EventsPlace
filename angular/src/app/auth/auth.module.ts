import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {SharedModule} from '../shared/shared.module';
import {AuthRoutingModule} from './auth-routing.module';

import {AuthComponent} from './login/auth.component';
import {RegistrationComponent} from './registration/registration.component';
import { ActivationPageComponent } from './activation-page/activation-page.component';




@NgModule({
  declarations: [
    AuthComponent,
    RegistrationComponent,
    ActivationPageComponent
  ],
    imports: [
        SharedModule,
        RouterModule,
        AuthRoutingModule,
        FormsModule
    ]
})
export class AuthModule { }
