import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

import {SharedModule} from '../shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';

import {ModalDialogComponent, UserComponent} from './user.component';
import {UserDetailsComponent} from './user-details/user-details.component';
import {CreateUserComponent} from './create-user/create-user.component';
import {UsersComponent} from './users/users.component';



@NgModule({
  declarations: [
    UserComponent,
    ModalDialogComponent,
    UserDetailsComponent,
    CreateUserComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    UsersRoutingModule
  ],
  entryComponents: [ ModalDialogComponent ]
})
export class UsersModule { }
