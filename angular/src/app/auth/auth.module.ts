import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {SharedModule} from '../shared/shared.module';

import {RegistrationComponent} from './registration/registration.component';
import {AuthComponent} from './login/auth.component';
import {AuthRoutingModule} from './auth-routing.module';
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
        FormsModule,
        ReactiveFormsModule
    ]
})
export class AuthModule { }
