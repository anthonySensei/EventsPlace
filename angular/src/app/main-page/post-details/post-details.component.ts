import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';

import {MatDialog} from '@angular/material/dialog';

import {Subscription} from 'rxjs';

import {Post} from '../post.model';
import {User} from '../../user/user.model';

import {PostService} from '../post.service';
import {AuthService} from '../../auth/auth.service';
import {StorageService} from '../../storage.service';
import {MaterialService} from '../../shared/material.service';

import {RejectedDeletedReasonModalComponent} from './rejected-deleted-reason-modal/rejected-deleted-reason-modal.component';

import {SnackBarClassesEnum} from '../../shared/snackBarClasses.enum';


@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.sass']
})
export class PostDetailsComponent implements OnInit, OnDestroy {
  post: Post;
  postId: number;
  isLoading = false;
  paramsSubscription: Subscription;
  responseSubscription: Subscription;
  postSubscription: Subscription;
  isUpdatedPostStatus: boolean;
  message: string;
  error: string;
  response;

  user: User;
  userRole: string;

  reason: string;

  snackbarDuration = 5000;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private storageService: StorageService,
              private postService: PostService,
              private authService: AuthService,
              private materialService: MaterialService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.authService.autoLogin();
    this.isLoading = true;
    this.paramsSubscription = this.route.params
      .subscribe((params: Params) => {
        this.postId = +params.id;
      });
    this.user = this.authService.getUser();
    if (this.user) {
      this.userRole = this.user.role.role;
    } else {
      this.userRole = '';
    }
    this.postService.getPostHttp(this.postId, this.userRole).subscribe();
    this.postSubscription = this.postService.postChanged
      .subscribe(post => {
        this.post = post;
        if (!this.post) {
          this.router.navigate(['/error-page']);
        }
        this.isLoading = false;
      });
    this.post = this.postService.getPost();
    this.responseSubscription = this.storageService.responseChanged
      .subscribe(response => {
        this.response = response;
        this.isUpdatedPostStatus = this.response.data.postUpdated;
      });
  }

  onSetStatus(status: string, post: Post) {
    if (status === 'rejected' || status === 'deleted') {
      this.openRejectedDeletedReasonModal(status, post);
    } else {
      post.postStatus = status;
      this.storageService.setPostStatus(post)
        .subscribe(() => {
          if (this.isUpdatedPostStatus) {
            this.message = this.response.data.message + ' to ' + '\'' + status.toUpperCase() + '\'';
            this.router.navigate(['/posts']);
            this.openSnackBar(this.message, SnackBarClassesEnum.Success, this.snackbarDuration);
          } else {
            this.error = this.response.data.message;
            return false;
          }
        });
    }
  }

  openSnackBar(message: string, style: string, duration: number) {
    this.materialService.openSnackBar(message, style, duration);
  }

  openRejectedDeletedReasonModal(status: string, post: Post): void {
    const dialogRef = this.dialog.open(RejectedDeletedReasonModalComponent, {
      width: '70%',
      data: {
        reason: this.reason
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return false;
      }
      this.reason = result;
      post.reason = this.reason;
      post.postStatus = status;
      this.storageService.setPostStatus(post)
        .subscribe(() => {
          if (this.isUpdatedPostStatus) {
            this.message = this.response.data.message + ' to ' + '\'' + status.toUpperCase() + '\'';
            this.router.navigate(['/posts']);
            this.openSnackBar(this.message, SnackBarClassesEnum.Success, this.snackbarDuration);
          } else {
            this.error = this.response.data.message;
            return false;
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }
}
