import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subscription} from 'rxjs';

import {StorageService} from '../../storage.service';

import {Post} from '../post.model';


@Component({
  selector: 'app-unchecked-posts',
  templateUrl: './unchecked-posts.component.html',
  styleUrls: ['./unchecked-posts.component.css']
})
export class UncheckedPostsComponent implements OnInit, OnDestroy {
  posts: Post[];
  postsFetchSubscription: Subscription;
  postsChangedSubscription: Subscription;
  isLoading: boolean;

  constructor(private storageService: StorageService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsFetchSubscription = this.storageService.fetchAllPosts().subscribe();
    this.postsChangedSubscription = this.storageService.postsChanged
      .subscribe((posts: Post[]) => {
        this.posts = posts.filter((currentValue) => currentValue.postStatus === 'unconfirmed');
        this.isLoading = false;
      });
    this.posts = this.storageService.getPosts();
  }

  ngOnDestroy(): void {
    this.postsFetchSubscription.unsubscribe();
    this.postsChangedSubscription.unsubscribe();
  }

}
