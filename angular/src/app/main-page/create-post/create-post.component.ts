import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {PostService} from '../post.service';
import {AuthService} from '../../auth/auth.service';
import {MaterialService} from '../../shared/material.service';
import {CanComponentDeactivate} from '../../shared/can-deactivate-guard.service';

import {User} from '../../user/user.model';
import {Hashtag} from '../hashtag.model';
import {Post} from '../post.model';

import {Observable, Subject, Subscription} from 'rxjs';

import {SnackBarClassesEnum} from '../../shared/snackBarClasses.enum';

import {ModalPostCreateDialogComponent} from './choose-post-image-modal/choose-post-image-modal.component';

export interface DialogData {
  imageBase64: string;
}

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['../../auth/login/auth.component.sass']
})
export class CreatePostComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  createPostForm: FormGroup;

  isCreated: boolean;
  message: string;
  error: string;
  response;

  responseSubscription: Subscription;
  userSubscription: Subscription;
  paramsSubscription: Subscription;
  postSubscription: Subscription;
  getPostSubscription: Subscription;
  getHashtagsHttpSubscription: Subscription;
  hashtagSubscription: Subscription;

  user: User;

  editMode = false;
  postId: number;

  isUpdated: boolean;
  isLoading = false;
  isDone = false;

  discard = false;
  discardChanged = new Subject<boolean>();

  post: Post;

  snackbarDuration = 5000;
  snackBarMessage = 'Post was created successfully';

  choosePostImageWidth = '70%';

  imageToUploadBase64: string = null;

  oldPassword: string;
  newPassword: string;
  retypeNewPassword: string;

  hashtags: Hashtag[];

  constructor(private postService: PostService,
              private authService: AuthService,
              public materialService: MaterialService,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.authService.autoLogin();
    this.createPostForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      location: new FormControl(null, [Validators.required]),
      time: new FormControl(null, [Validators.required]),
      hashtag: new FormControl(null, [Validators.required])
    });
    this.getHashtagsHttpSubscription = this.postService.getHashtagsHttp().subscribe();
    this.hashtagSubscription = this.postService.hashtagsChanged
      .subscribe(hashtags => {
        this.hashtags = hashtags;
      });
    this.hashtags = this.postService.getHashtags();
    this.paramsSubscription = this.route.queryParams
      .subscribe((queryParams: Params) => {
        this.postId = +queryParams.id;
        this.editMode = queryParams.id != null;
      });
    if (this.editMode) {
      this.isLoading = true;
      this.getPostSubscription = this.postService.getPostHttp(this.postId).subscribe();
      this.postSubscription = this.postService.postChanged
        .subscribe(post => {
          this.post = post;
          this.isLoading = false;
          this.createPostForm.patchValue({
            name: this.post.eventName,
            description: this.post.description,
            location: this.post.eventLocation,
            hashtag: this.post.hashtag.name,
            time: this.post.eventTime
          });
        });
      this.post = this.postService.getPost();
    }
    this.responseSubscription = this.postService.responseChanged
      .subscribe((response: {
        responseCode: string;
        data: {
          postCreated: boolean,
          message: string
        }
      }) => {
        if (response.data) {
          this.response = response;
          if (this.response.data.postCreated) {
            this.isCreated = this.response.data.postCreated;
          } else if (this.response.data.postUpdated) {
            this.isUpdated = this.response.data.postUpdated;
          }
        }
      });
    this.userSubscription = this.authService.userChanged
      .subscribe(user => {
        this.user = user;
      });
    this.user = this.authService.getUser();
  }

  hasError(controlName: string, errorName: string) {
    return this.createPostForm.controls[controlName].hasError(errorName);
  }

  openChoosePostImageDialog(): void {
    const dialogRef = this.dialog.open(ModalPostCreateDialogComponent, {
      width: this.choosePostImageWidth,
      data: {
        imageBase64: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.imageToUploadBase64 = result;
    });
  }

  onCreatePost() {
    const description = this.createPostForm.value.description;
    const eventName = this.createPostForm.value.name;
    const eventLocation = this.createPostForm.value.location;
    const eventTime = this.createPostForm.value.time;
    const user = this.user;
    const hashtagName = this.createPostForm.value.hashtag;
    const hashtag = this.hashtags.filter(hs => hs.name === hashtagName)[0];
    if (this.createPostForm.invalid) {
      return;
    }
    const post = {
      description,
      eventName,
      eventLocation,
      eventTime,
      user,
      hashtag
    };
    if (!this.imageToUploadBase64 && !this.editMode) {
      this.openSnackBar('Image was not selected', SnackBarClassesEnum.Warn, this.snackbarDuration);
      return false;
    }
    if (this.editMode) {
      this.postService
        .updatePost(this.postId, post, this.imageToUploadBase64)
        .subscribe(() => {
          if (this.isUpdated) {
            console.log('Updated');
            this.isDone = true;
            this.message = this.response.data.message;
            this.router.navigate(['/posts']);
            this.snackBarMessage = 'Post was updated successfully';
            this.openSnackBar(this.snackBarMessage, SnackBarClassesEnum.Success, this.snackbarDuration);
          } else {
            this.isDone = false;
            this.error = this.response.data.message;
            return false;
          }
        });
    } else {
      this.postService
        .createPost(post, this.imageToUploadBase64)
        .subscribe(() => {
          if (this.isCreated) {
            this.isDone = true;
            this.message = this.response.data.message;
            this.router.navigate(['/posts']);
            this.openSnackBar(this.snackBarMessage, SnackBarClassesEnum.Success, this.snackbarDuration);
          } else {
            this.isDone = false;
            this.error = this.response.data.message;
            return false;
          }
        });
    }
  }

  openSnackBar(message: string, style: string, duration: number) {
    this.materialService.openSnackBar(message, style, duration);
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.createPostForm.touched && !this.isDone) {
      this.materialService.openDiscardChangesDialog(this.discard, this.discardChanged);
      return this.discardChanged;
    } else {
      return true;
    }
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.responseSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }
}
