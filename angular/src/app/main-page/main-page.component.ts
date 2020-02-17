import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, NgModel} from '@angular/forms';

import {StorageService} from '../storage.service';

import {Post} from './post.model';

import {Subscription} from 'rxjs';
import {MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material';
import {AuthService} from '../auth/auth.service';


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

  position = new FormControl('above');
  allPosts: Post[] = [];
  posts: Post[] = [];
  cards;
  cardsContent;
  postsSubscription: Subscription;
  loggedInSubscription: Subscription;
  isLoading = false;
  isLoggedIn;
  grid = 'FOUR';
  filterContainer;
  showFilterButton = true;
  selected: string;

  page = 1;

  constructor(private storageService: StorageService,
              private authService: AuthService,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.postsSubscription = this.storageService.postsChanged
      .subscribe((posts: Post[]) => {
        this.allPosts = posts.filter((current) => current.postStatus === 'approved');
        this.posts = this.allPosts;
        this.isLoading = false;
      });
    this.loggedInSubscription = this.authService.loggedChange
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      });
    this.isLoggedIn = this.authService.getIsLoggedIn();
    this.cards = document.getElementsByClassName('card');
    this.cardsContent = document.getElementsByClassName('container');
    this.filterContainer = document.getElementsByClassName('filter-container')[0];
    this.storageService.fetchAllPosts().subscribe();
    for (const post of this.allPosts) {
      if (!post.postImage) {
        post.postImage = 'https://images.pexels.com/photos/3558597/pexels-photo-3558597.jpeg';
      } else {
        post.postImage = 'localhost:3000/' + post.postImage;
      }
    }
    this.allPosts = this.storageService.getPosts();
    this.posts = this.allPosts;

  }

  openSnackBar() {
    this.snackBar.openFromComponent(MainPageSnackbarComponent, {
      data: this.snackBarMessage,
      ...this.snackBarConfig
    });
  }

  three() {
    for (const element of this.cards) {
      element.style.msFlex = '30%';  // IE10
      element.style.flex = '30%';
      element.style.maxWidth = '32%';
    }
  }

  four() {
    for (const element of this.cards) {
      element.style.msFlex = '20%';  // IE10
      element.style.flex = '20%';
      element.style.maxWidth = '25%';
    }
  }


  changeGrid() {
    if (this.grid === 'TWO') {
      this.four();
      this.grid = 'FOUR';
    } else {
      this.three();
      this.grid = 'TWO';
    }
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }

  search(filter: NgModel) {
    if (this.selected === 'email') {
      this.posts = this.allPosts.filter(current => current.user.email === filter.value);
    } else if (this.selected === 'hashtag') {
      this.posts = this.allPosts.filter(current => current.hashtag.name === filter.value);
    } else if (this.selected === 'location') {
      this.posts = this.allPosts.filter(current => current.eventLocation === filter.value);
    } else if (this.selected === 'username') {
      this.posts = this.allPosts.filter(current => current.user.name === filter.value);
    } else if (this.selected === 'all') {
      this.posts = this.allPosts;
    }
  }

  toggleFilterButton() {
    this.showFilterButton = !this.showFilterButton;
  }
}

@Component({
  selector: 'app-snackbar',
  templateUrl: 'main-page-snackbar.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<MainPageSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
