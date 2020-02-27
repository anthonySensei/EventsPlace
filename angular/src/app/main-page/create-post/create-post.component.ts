import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';

import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

import {PostService} from '../post.service';
import {AuthService} from '../../auth/auth.service';

import {User} from '../../user/user.model';
import {Hashtag} from '../hashtag.model';

import {Observable, Subscription} from 'rxjs';

import {ImageCroppedEvent} from 'ngx-image-cropper';

import {CanComponentDeactivate} from '../../shared/can-deactivate-guard.service';

import {Post} from '../post.model';

export interface DialogData {
  imageBase64: string;
}
@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['../../auth/login/auth.component.css']
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

  post: Post;

  snackbarDuration = 5000;
  snackBarMessage = 'Post was created successfully';

  imageToUploadBase64: string = null;

  oldPassword: string;
  newPassword: string;
  retypeNewPassword: string;

  hashtags: Hashtag[];

  constructor(private postService: PostService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public dialog: MatDialog) {
  }

  ngOnInit() {
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
          console.log(this.post.hashtag);
          this.createPostForm.patchValue({
              name: this.post.eventName,
              description: this.post.description,
              location: this.post.eventLocation,
              hashtag: this.post.hashtag.name
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

  openDialog(): void {
    const dialogRef = this.dialog.open(ModalPostCreateDialogComponent, {
      width: '70%',
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
    const hashtag = this.createPostForm.value.hashtag;
    if (!description || !eventName || !eventLocation || !user || !hashtag || !eventTime) {
        this.error = 'Fields are required';
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
    if (!this.imageToUploadBase64) {
      this.openSnackBar('Image was not selected', 'warn-snackbar');
      return false;
    }
    if (this.editMode) {
      this.postService
        .updatePost(this.postId, post, this.imageToUploadBase64)
        .subscribe( () => {
          if (this.isUpdated) {
            console.log('Updated');
            this.message = this.response.data.message;
            this.router.navigate(['/posts']);
            this.snackBarMessage = 'Post was updated successfully';
            this.openSnackBar(this.snackBarMessage, 'success-snackbar');
          } else {
            this.error = this.response.data.message;
            return false;
          }
        });
    } else {
      this.postService
        .createPost(post, this.imageToUploadBase64)
        .subscribe( () => {
          if (this.isCreated) {
            this.message = this.response.data.message;
            this.router.navigate(['/posts']);
            this.openSnackBar(this.snackBarMessage, 'success-snackbar');
          } else {
            this.error = this.response.data.message;
            return false;
          }
        });
    }
  }


  openSnackBar(message: string, style) {
    const config = new MatSnackBarConfig();
    config.panelClass = [style];
    config.duration = this.snackbarDuration;
    this.snackBar.open(message, null, config);
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.createPostForm.touched) {
      console.log('Can deactivate');
      return confirm('Do you want to discard the changes?');
    } else {
      return true;
    }
  }

  ngOnDestroy(): void {
    // this.paramsSubscription.unsubscribe();
    // // this.postSubscription.unsubscribe();
    // this.getPostSubscription.unsubscribe();
    // if (this.responseSubscription) {
    //   this.responseSubscription.unsubscribe();
    // }
    // if (this.userSubscription) {
    //   this.userSubscription.unsubscribe();
    // }
  }
}

@Component({
  selector: 'app-dialog',
  templateUrl: './choose-image-modal.component.html',
  styleUrls: ['../../auth/login/auth.component.css']
})
export class ModalPostCreateDialogComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';


  constructor(
    public dialogRef: MatDialogRef<ModalPostCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    dialogRef.disableClose = true;
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.data.imageBase64 = this.croppedImage;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
