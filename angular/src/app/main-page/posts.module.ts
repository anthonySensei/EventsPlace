import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {SharedModule} from '../shared/shared.module';
import {PostsRoutingModule} from './posts-routing.module';

import {MainPageComponent, MainPageSnackbarComponent} from './main-page.component';
import {PostDetailsComponent} from './post-details/post-details.component';
import { CreatePostComponent, ModalPostCreateDialogComponent } from './create-post/create-post.component';
import { UncheckedPostsComponent } from './unchecked-posts/unchecked-posts.component';


@NgModule({
  declarations: [
    MainPageComponent,
    PostDetailsComponent,
    CreatePostComponent,
    MainPageSnackbarComponent,
    UncheckedPostsComponent,
    ModalPostCreateDialogComponent
  ],
    imports: [
        RouterModule,
        PostsRoutingModule,
        SharedModule,
        FormsModule
    ],
  entryComponents: [ MainPageSnackbarComponent, ModalPostCreateDialogComponent ]
})
export class PostsModule {}
