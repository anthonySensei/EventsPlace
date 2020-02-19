import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post.model';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {StorageService} from '../../storage.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';
import {User} from '../../user/user.model';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {PostService} from '../post.service';


@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.css']
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

  snackbarDuration = 5000;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private storageService: StorageService,
              private postService: PostService,
              private authService: AuthService,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.isLoading = true;
    this.paramsSubscription = this.route.params
      .subscribe((params: Params) => {
          this.postId = +params.id;
      });
    this.postService.getPostHttp(this.postId).subscribe();
    this.postSubscription = this.postService.postChanged
      .subscribe(post => {
        this.post = post;
        this.isLoading = false;
      });
    this.post = this.postService.getPost();
    this.responseSubscription = this.storageService.responseChanged
      .subscribe(response => {
         this.response = response;
         this.isUpdatedPostStatus = this.response.data.postUpdated;
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
    this.paramsSubscription.unsubscribe();
  }
}
