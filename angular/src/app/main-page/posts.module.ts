import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {SharedModule} from '../shared/shared.module';
import {PostsRoutingModule} from './posts-routing.module';

import {MainPageComponent} from './main-page.component';
import {PostDetailsComponent} from './post-details/post-details.component';
import { CreatePostComponent, ModalPostCreateDialogComponent } from './create-post/create-post.component';
import { UncheckedPostsComponent } from './unchecked-posts/unchecked-posts.component';

import {RejectedDeletedReasonModalComponent} from './post-details/rejected-deleted-reason-modal/rejected-deleted-reason-modal.component';
import {MainPageSnackbarComponent} from './main-page-snackbar/main-page-snackbar.component';


@NgModule({
  declarations: [
    MainPageComponent,
    PostDetailsComponent,
    CreatePostComponent,
    MainPageSnackbarComponent,
    UncheckedPostsComponent,
    ModalPostCreateDialogComponent,
    RejectedDeletedReasonModalComponent
  ],
    imports: [
        RouterModule,
        PostsRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule
    ],
  entryComponents: [
    MainPageSnackbarComponent,
    ModalPostCreateDialogComponent,
    RejectedDeletedReasonModalComponent
  ]
})
export class PostsModule {}
