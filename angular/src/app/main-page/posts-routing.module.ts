import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {MainPageComponent} from './main-page.component';
import {PostDetailsComponent} from './post-details/post-details.component';
import {CreatePostComponent} from './create-post/create-post.component';
import {UncheckedPostsComponent} from './unchecked-posts/unchecked-posts.component';

import {AuthGuard} from '../auth/auth.guard';
import {ManagerGuard} from '../user/manager.guard';
import {CanDeactivateGuard} from '../shared/can-deactivate-guard.service';

const routes: Routes = [
  { path: 'posts', component: MainPageComponent },
  { path: 'post-managing', canActivate: [AuthGuard, ManagerGuard], component: UncheckedPostsComponent },
  { path: 'posts/:id', component: PostDetailsComponent },
  { path: 'create-post', canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard], component: CreatePostComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostsRoutingModule {}
