import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgModel} from '@angular/forms';

import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

import {StorageService} from '../storage.service';
import {AuthService} from '../auth/auth.service';

import {Post} from './post.model';

import {Subscription} from 'rxjs';

import {MainPageSnackbarComponent} from './main-page-snackbar/main-page-snackbar.component';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {query} from '@angular/animations';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.sass']
})
export class MainPageComponent implements OnInit, OnDestroy {
  snackBarConfig: MatSnackBarConfig = {
    panelClass: 'main-page-snackbar',
    duration: 10000
  };
  snackBarMessage = 'Please login to continue';

  posts: Post[] = [];

  response;

  paramsSubscription: Subscription;
  postsSubscription: Subscription;
  loggedInSubscription: Subscription;
  responseSubscription: Subscription;

  isLoading = false;
  isLoggedIn = false;
  showFilterButton = true;

  selected = 'all';
  filterValue = '';

  currentPage = 1;

  hasNextPage;
  hasPreviousPage;
  nextPage;
  previousPage;
  lastPage;

  fromDate: Date;
  toDate: Date;
  dateObj;

  queries = {};

  constructor(private storageService: StorageService,
              private authService: AuthService,
              public snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.authService.autoLogin();
    this.isLoading = true;
    this.paramsSubscription = this.route.queryParams
      .subscribe((params: Params) => {
        this.currentPage = +params.page || 1;
        this.selected = params.filter || 'all';
        this.filterValue = params.value || '';
        if (params.fDate) {
          this.fromDate = params.fDate;
        }
        if (params.tDate) {
          this.toDate = params.tDate;
        }
        this.dateObj = {fromDate: this.fromDate, toDate: this.toDate};
        this.paginate(this.currentPage, this.selected, this.filterValue);
      });
    this.storageService.fetchApprovedPosts(this.selected, this.filterValue, this.dateObj, this.currentPage).subscribe();
    this.postsSubscription = this.storageService.postsChanged
      .subscribe((posts: Post[]) => {
        this.posts = posts;
        this.isLoading = false;
      });
    this.loggedInSubscription = this.authService.loggedChange
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      });
    this.isLoggedIn = this.authService.getIsLoggedIn();
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
          if (this.response.data.filterData) {
            this.selected = this.response.data.filterData.filter;
            this.filterValue = this.response.data.filterData.value;
          }
          if (this.response.data.date) {
            this.fromDate = this.response.data.date.fromDate;
            this.toDate = this.response.data.date.toDate;
          }
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

  search() {
    if (!this.isIsoDate(this.fromDate) && !this.isIsoDate(this.toDate)) {
      this.dateObj = {
        fromDate: this.fromDate ? this.fromDate.toISOString() : this.fromDate,
        toDate: this.toDate ? this.toDate.toISOString() : this.toDate
      };
    } else if (!this.isIsoDate(this.fromDate)) {
      this.dateObj = {
        fromDate: this.fromDate ? this.fromDate.toISOString() : this.fromDate,
        toDate: this.toDate ? this.toDate : this.toDate
      };
    } else if (!this.isIsoDate(this.toDate)) {
      this.dateObj = {
        fromDate: this.fromDate ? this.fromDate : this.fromDate,
        toDate: this.toDate ? this.toDate.toISOString() : this.toDate
      };
    } else {
      this.dateObj = {
        fromDate: this.fromDate ? this.fromDate : this.fromDate,
        toDate: this.toDate ? this.toDate : this.toDate
      };
    }
    if (this.selected === 'email') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('email', this.filterValue, this.dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
          this.paginate(1, this.selected, this.filterValue);
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'hashtag') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('hashtag', this.filterValue, this.dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
          this.paginate(1, this.selected, this.filterValue);
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'location') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('location', this.filterValue, this.dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
          this.paginate(1, this.selected, this.filterValue);
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'username') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('username', this.filterValue, this.dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
          this.paginate(1, this.selected, this.filterValue);
        });
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'all') {
      this.isLoading = true;
      this.storageService.fetchApprovedPosts('all', '', this.dateObj, this.currentPage)
        .subscribe(() => {
          this.isLoading = false;
          this.paginate(1, this.selected, this.filterValue);
        });
      this.posts = this.storageService.getPosts();
    }
  }

  paginate(page: number, filter?: string, filterValue?: string) {
    this.isLoading = true;
    this.currentPage = page;
    this.dateObj = {fromDate: this.fromDate, toDate: this.toDate};

    this.storageService.fetchApprovedPosts(this.selected, this.filterValue, this.dateObj, this.currentPage)
      .subscribe(() => {
        this.isLoading = false;
        if (filter && filterValue) {
          if (this.fromDate && this.toDate) {
            this.queries = {
              page,
              filter,
              value: filterValue,
              fDate: this.fromDate,
              tDate: this.toDate
            };
          } else if (this.fromDate) {
            this.queries = {
              page,
              filter,
              value: filterValue,
              fDate: this.fromDate
            };
          } else if (this.toDate) {
            this.queries = {
              page,
              filter,
              value: filterValue,
              tDate: this.toDate
            };
          } else {
            this.queries = {
              page,
              filter,
              value: filterValue
            };
          }
        } else {
          if (this.fromDate && this.toDate) {
            this.queries = {
              page,
              fDate: this.fromDate,
              tDate: this.toDate
            };
          } else if (this.fromDate) {
            this.queries = {
              page,
              fDate: this.fromDate
            };
          } else if (this.toDate) {
            this.queries = {
              page,
              tDate: this.toDate
            };
          } else {
            this.queries = {
              page
            };
          }
        }
        if (page <= this.lastPage) {
          this.router.navigate(['/posts'], {queryParams: this.queries});
        } else {
          if (filterValue) {
            if (this.fromDate && this.toDate) {
              this.queries = {
                page: 1,
                filter,
                value: filterValue,
                fDate: this.fromDate,
                tDate: this.toDate
              };
            } else if (this.fromDate) {
              this.queries = {
                page: 1,
                filter,
                value: filterValue,
                fDate: this.fromDate
              };
            } else if (this.toDate) {
              this.queries = {
                page: 1,
                filter,
                value: filterValue,
                tDate: this.toDate
              };
            } else {
              this.queries = {
                page: 1,
                filter,
                value: filterValue
              };
            }
            this.queries = {page: 1, filter, value: filterValue};
          } else {
            this.router.navigate(['/posts'], {queryParams: this.queries});
          }
        }
      });
    this.posts = this.storageService.getPosts();
  }

  toggleFilterButton() {
    this.showFilterButton = !this.showFilterButton;
  }

  isIsoDate(str) {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
      return false;
    }
    const d = new Date(str);
    return d.toISOString() === str;
  }

  clearInputs() {
    this.selected = 'all';
    this.filterValue = '';
    this.fromDate = null;
    this.toDate = null;
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }

}

