import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from '../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

import {UserComponent} from './user.component';
import {CreateUserComponent} from './create-user/create-user.component';
import {ChangePasswordModalComponent} from './change-password-modal/change-password-modal.component';
import {ChangeProfileImageModalComponent} from './change-profile-image/change-profile-image-modal.component';




@NgModule({
  declarations: [
    UserComponent,
    ChangePasswordModalComponent,
    ChangeProfileImageModalComponent,
    CreateUserComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        UsersRoutingModule
    ],
  entryComponents: [ ChangePasswordModalComponent, ChangeProfileImageModalComponent ]
})
export class UsersModule { }
