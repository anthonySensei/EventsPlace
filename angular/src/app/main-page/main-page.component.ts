import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

import {StorageService} from '../storage.service';

import {Post} from './post.model';

import {Subscription} from 'rxjs';
import {MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarConfig, MatSnackBarRef} from '@angular/material';
import {User} from '../user/user.model';
import {Role} from '../user/role.model';


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
  posts: Post[] = [];
  cards;
  cardsContent;
  subscription: Subscription;
  isLoading = false;
  grid = 'FOUR';
  filterContainer;
  showFilterButton = true;
  user: User;

  constructor(private storageService: StorageService,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.subscription = this.storageService.postsChanged
      .subscribe((posts: Post[]) => {
        this.posts = posts.filter((current) => current.postStatus === 'approved');
        this.isLoading = false;
      });
    this.cards = document.getElementsByClassName('card');
    this.cardsContent = document.getElementsByClassName('container');
    this.filterContainer = document.getElementsByClassName('filter-container')[0];
    this.storageService.fetchAllPosts().subscribe();
    this.posts = this.storageService.getPosts();
    this.user = {
      userId: 1,
      name: '',
      email: '',
      password: '',
      createdAt: new Date(),
      role: new Role(1, 'admin')
    };
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
    this.subscription.unsubscribe();
  }

  search() {}

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
