import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MainPageComponent} from './main-page.component';
import {PostDetailsComponent} from './post-details/post-details.component';
import {CreatePostComponent} from './create-post/create-post.component';
import {AuthGuard} from '../auth/auth.guard';
import {UncheckedPostsComponent} from './unchecked-posts/unchecked-posts.component';

const routes: Routes = [
  { path: 'posts', component: MainPageComponent },
  { path: 'post-managing', canActivate: [AuthGuard], component: UncheckedPostsComponent },
  { path: 'posts/:id', component: PostDetailsComponent },
  { path: 'create-post', canActivate: [AuthGuard], component: CreatePostComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostsRoutingModule {}
