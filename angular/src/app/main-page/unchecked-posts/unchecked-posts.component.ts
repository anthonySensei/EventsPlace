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

  response;

  responseSubscription: Subscription;

  selected = 'unconfirmed';

  currentPage = 1;

  hasNextPage;
  hasPreviousPage;
  nextPage;
  previousPage;
  lastPage;

  constructor(private storageService: StorageService) {
  }

  ngOnInit() {
    console.log(this.selected);
    this.isLoading = true;
    this.postsFetchSubscription = this.storageService.fetchAllPosts('unconfirmed', this.currentPage).subscribe();
    this.postsChangedSubscription = this.storageService.postsChanged
      .subscribe((posts: Post[]) => {
        this.posts = posts;
        this.isLoading = false;
      });
    this.posts = this.storageService.getPosts();
    this.responseSubscription = this.storageService.responseChanged
      .subscribe(response => {
        this.response = response;
        if (this.response.data.paginationData) {
          this.currentPage = this.response.data.paginationData.currentPage;
          this.nextPage = this.response.data.paginationData.nextPage;
          this.previousPage = this.response.data.paginationData.previousPage;
          this.hasNextPage = this.response.data.paginationData.hasNextPage;
          this.hasPreviousPage = this.response.data.paginationData.hasPreviousPage;
          this.lastPage = this.response.data.paginationData.lastPage;
        }
      });
  }

  ngOnDestroy(): void {
    this.postsFetchSubscription.unsubscribe();
    this.postsChangedSubscription.unsubscribe();
  }

  changePostsByStatus() {
    this.currentPage = 1;
    if (this.selected === 'approved') {
      this.isLoading = true;
      this.storageService.fetchAllPosts('approved', this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'unconfirmed') {
      this.isLoading = true;
      this.storageService.fetchAllPosts('unconfirmed', this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'rejected') {
      this.isLoading = true;
      this.storageService.fetchAllPosts('rejected', this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'deleted') {
      this.isLoading = true;
      this.storageService.fetchAllPosts('deleted', this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'all') {
      this.isLoading = true;
      this.storageService.fetchAllPosts('all', this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
        });
      this.posts = this.storageService.getPosts();
    }
  }

  paginate(page: number) {
    this.isLoading = true;
    this.currentPage = page;
    this.storageService.fetchAllPosts(this.selected, this.currentPage)
      .subscribe(() => {
        this.isLoading = false;
      });
    this.posts = this.storageService.getPosts();
    console.log(page);
  }
}
