import {Component, OnDestroy, OnInit} from '@angular/core';

import {Subscription} from 'rxjs';

import {PostsStorageService} from '../postsStorage.service';

import {Post} from '../post.model';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AuthService} from '../../auth/auth.service';


@Component({
  selector: 'app-unchecked-posts',
  templateUrl: './unchecked-posts.component.html',
  styleUrls: ['../main-page.component.sass']
})
export class UncheckedPostsComponent implements OnInit, OnDestroy {
  posts: Post[];

  postsFetchSubscription: Subscription;
  postsChangedSubscription: Subscription;
  responseSubscription: Subscription;
  paramsSubscription: Subscription;

  isLoading: boolean;

  response;

  selected = 'unconfirmed';

  currentPage = 1;

  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number;
  previousPage: number;
  lastPage: number;

  queries = {};

  constructor(private storageService: PostsStorageService,
              private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.autoLogin();
    this.isLoading = true;
    this.paramsSubscription = this.route.queryParams
      .subscribe((params: Params) => {
        this.currentPage = +params.page || 1;
        this.selected = params.status || 'unconfirmed';
      });
    this.fetchAllPosts(this.selected, this.currentPage);
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
          if (this.response.data.status) {
            this.selected = this.response.data.status;
          }
        }
      });
  }

  changePostsByStatus() {
    this.currentPage = 1;
    if (this.selected === 'approved') {
      this.isLoading = true;
      this.fetchAllPosts('approved', this.currentPage);
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'unconfirmed') {
      this.isLoading = true;
      this.fetchAllPosts('unconfirmed', this.currentPage);
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'rejected') {
      this.isLoading = true;
      this.fetchAllPosts('rejected', this.currentPage);
      this.posts = this.storageService.getPosts();
    } else if (this.selected === 'all') {
      this.isLoading = true;
      this.fetchAllPosts('all', this.currentPage);
      this.posts = this.storageService.getPosts();
    }
  }

  fetchAllPosts(status: string, currentPage: number) {
    this.postsFetchSubscription = this.storageService.fetchAllPosts(status, currentPage)
      .subscribe(() => {
        this.paginate(this.currentPage, this.selected);
        this.isLoading = false;
      });
  }


  paginate(page: number, status: string) {
    this.isLoading = true;
    this.currentPage = page;
    this.storageService.fetchAllPosts(this.selected, this.currentPage)
      .subscribe(() => {
        this.isLoading = false;
        if (status) {
          this.queries = {page, status};
        } else {
          this.queries = {page};
        }
        if (page <= this.lastPage) {
          this.router.navigate(['/post-managing'], {queryParams: this.queries});
        } else {
          if (status) {
            this.queries = {page: 1, status};
          } else {
            this.router.navigate(['/post-managing'], {queryParams: this.queries});
          }
        }
      });
    this.posts = this.storageService.getPosts();
  }

  ngOnDestroy(): void {
    this.postsFetchSubscription.unsubscribe();
    this.postsChangedSubscription.unsubscribe();
    this.responseSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
  }
}
