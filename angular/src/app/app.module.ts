import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {AuthModule} from './auth/auth.module';
import {PostsModule} from './main-page/posts.module';
import {SharedModule} from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import {ModalDialogComponent, UserComponent} from './user/user.component';
import { HeaderComponent } from './header/header.component';
import { UserDetailsComponent } from './user/user-details/user-details.component';
import { CreateUserComponent } from './user/create-user/create-user.component';




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserComponent,
    UserDetailsComponent,
    ModalDialogComponent,
    CreateUserComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AuthModule,
        FormsModule,
        SharedModule,
        PostsModule,
        AppRoutingModule
    ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ ModalDialogComponent ]
})
export class AppModule { }
