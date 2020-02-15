import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {StorageService} from '../../storage.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';
import {User} from '../../user/user.model';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';


@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css']
})
export class PostDetailsComponent implements OnInit, OnDestroy {
  post: Post;
  postId: number;
  isLoading = false;
  postsSubscription: Subscription;
  paramsSubscription: Subscription;
  responseSubscription: Subscription;
  userSubscription: Subscription;
  isUpdatedPostStatus: boolean;
  message: string;
  error: string;
  response;
  user: User;
  userRole: string;

  snackbarDuration = 5000;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private storageService: StorageService,
              private authService: AuthService,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsSubscription = this.storageService.fetchAllPosts().subscribe();
    this.paramsSubscription = this.route.params
      .subscribe((params: Params) => {
          this.postId = +params.id;
          this.post = this.storageService.getPost(this.postId);
          this.isLoading = false;
      });
    this.responseSubscription = this.storageService.responseChanged
      .subscribe(response => {
         this.response = response;
         this.isUpdatedPostStatus = this.response.data.postUpdated;
      });
    this.userSubscription = this.authService.userChanged
      .subscribe(user => {
        this.user = user;
      });
    this.user = this.authService.getUser();
    if (this.user) {
      this.userRole = this.user.role.role;
    } else {
      this.userRole = '';
    }
  }

  onSetStatus(status: string, post: Post) {
    post.postStatus = status;
    if (status === 'rejected' || status === 'deleted') {
      post.reason = prompt('Input reason: ', '');
    }
    this.storageService.setPostStatus(post)
      .subscribe(() => {
        if (this.isUpdatedPostStatus) {
          this.message = this.response.data.message + ' to ' + '\'' + status.toUpperCase() + '\'';
          this.router.navigate(['/posts']);
          this.openSnackBar(this.message, null);
        } else  {
          this.error = this.response.data.message;
          return false;
        }
      });
  }

  openSnackBar(message: string, action: string) {
    const config = new MatSnackBarConfig();
    config.panelClass = ['snackbar'];
    config.duration = this.snackbarDuration;
    this.snackBar.open(message, action, config);
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
  }
}
