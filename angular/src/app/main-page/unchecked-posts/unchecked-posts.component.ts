import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subscription} from 'rxjs';

import {StorageService} from '../../storage.service';

import {Post} from '../post.model';
import {element} from 'protractor';


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
  allPosts: Post[];

  page = 1;

  selected = 'unconfirmed';

  constructor(private storageService: StorageService) {
  }

  ngOnInit() {
    console.log(this.selected);
    this.isLoading = true;
    this.postsFetchSubscription = this.storageService.fetchAllPosts().subscribe();
    this.postsChangedSubscription = this.storageService.postsChanged
      .subscribe((posts: Post[]) => {
        this.allPosts = posts;
        this.posts = this.allPosts.filter((currentValue) => currentValue.postStatus === this.selected);
        this.isLoading = false;
      });
    this.allPosts = this.storageService.getPosts();
    this.posts = this.allPosts.filter((currentValue) => currentValue.postStatus === this.selected);
  }

  ngOnDestroy(): void {
    this.postsFetchSubscription.unsubscribe();
    this.postsChangedSubscription.unsubscribe();
  }

  changePostsByStatus() {
    if (this.selected === 'all') {
      this.posts = this.allPosts;
    } else {
      this.posts = this.allPosts.filter((currentValue) => currentValue.postStatus === this.selected);
    }
  }
}
