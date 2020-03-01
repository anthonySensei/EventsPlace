import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgModel} from '@angular/forms';

import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

import {StorageService} from '../storage.service';
import {AuthService} from '../auth/auth.service';

import {Post} from './post.model';

import {Subscription} from 'rxjs';

import {MainPageSnackbarComponent} from './main-page-snackbar/main-page-snackbar.component';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
  snackBarConfig: MatSnackBarConfig = {
    panelClass: 'main-page-snackbar',
    duration: 10000
  };
  snackBarMessage = 'Please login to continue';

  posts: Post[] = [];

  response;

  postsSubscription: Subscription;
  loggedInSubscription: Subscription;
  responseSubscription: Subscription;

  isLoading = false;
  isLoggedIn;
  showFilterButton = true;
  selected = 'all';
  filter: string;

  currentPage = 1;

  hasNextPage;
  hasPreviousPage;
  nextPage;
  previousPage;
  lastPage;

  fromDate: Date;
  toDate: Date;

  constructor(private storageService: StorageService,
              private authService: AuthService,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.authService.autoLogin();
    this.isLoading = true;
    this.postsSubscription = this.storageService.postsChanged
      .subscribe((posts: Post[]) => {
        this.posts = posts;
        this.isLoading = false;
        console.log(this.posts);
      });
    this.loggedInSubscription = this.authService.loggedChange
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
    });
    this.isLoggedIn = this.authService.getIsLoggedIn();
    this.storageService.fetchApprovedPosts('all', '', {}, this.currentPage).subscribe();
    for (const post of this.posts) {
      if (!post.postImage) {
        post.postImage = 'https://images.pexels.com/photos/3558597/pexels-photo-3558597.jpeg';
      } else {
        post.postImage = 'localhost:3000/' + post.postImage;
      }
    }
    this.posts =  this.storageService.getPosts();
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
    this.response = this.storageService.getResponse();
  }

  openSnackBar() {
    this.snackBar.openFromComponent(MainPageSnackbarComponent, {
      data: this.snackBarMessage,
      ...this.snackBarConfig
    });
  }

  search(filter: NgModel) {
    this.filter = filter.value;
    this.currentPage = 1;
    const dateObj = {
      fromDate: this.fromDate ? this.fromDate.toISOString() : this.fromDate,
      toDate: this.toDate ? this.toDate.toISOString() : this.toDate
    };
    console.log(this.toDate);
    if (this.selected === 'email') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('email', this.filter, dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
      });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'hashtag') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('hashtag', filter.value, dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
      });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'location') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('location', filter.value, dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
      });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'username') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('username', filter.value, dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
      });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'all') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('all', '', dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
      });
      this.posts = this.storageService.getPosts();
    }
  }

  paginate(page: number) {
    this.isLoading = true;
    this.currentPage = page;
    this.storageService.fetchApprovedPosts(this.selected, this.filter, {}, this.currentPage)
      .subscribe(() => {
        this.isLoading = false;
      });
    this.posts = this.storageService.getPosts();
    console.log(page);
  }

  toggleFilterButton() {
    this.showFilterButton = !this.showFilterButton;
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }

}

