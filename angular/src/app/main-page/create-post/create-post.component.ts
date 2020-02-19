import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {NgForm, NgModel} from '@angular/forms';
import {PostService} from '../post.service';
import {User} from '../../user/user.model';
import {Hashtag} from '../hashtag.model';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

export interface DialogData {
  imageBase64: string;
}
@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['../../auth/login/auth.component.css']
})
export class CreatePostComponent implements OnInit, OnDestroy {
  isCreated: boolean;
  message: string;
  error: string;
  response;
  responseSubscription: Subscription;
  userSubscription: Subscription;
  user: User;

  snackbarDuration = 5000;
  snackBarMessage = 'Post was created successfully';

  imageToUploadBase64: string = null;

  oldPassword: string;
  newPassword: string;
  retypeNewPassword: string;

  constructor(private postService: PostService,
              private authService: AuthService,
              private router: Router,
              public snackBar: MatSnackBar,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.responseSubscription = this.postService.responseChanged
      .subscribe((response: {
        responseCode: string;
        data: {
          postCreated: boolean,
          message: string
        }
      }) => {
        console.log(response.data);
        if (response.data) {
          this.response = response;
          this.isCreated = this.response.data.postCreated;
        }
      });
    this.userSubscription = this.authService.userChanged
      .subscribe(user => {
        this.user = user;
      });
    this.user = this.authService.getUser();
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

  onCreatePost(eventName: NgModel,
               postDescription: HTMLTextAreaElement,
               eventLocation: NgModel,
               createPostForm: NgForm) {
    const post = {
      description: postDescription.value,
      eventName: eventName.value,
      eventLocation: eventLocation.value,
      user: this.user,
      hashtag: new Hashtag(1, 'test')
    };
    console.log(this.imageToUploadBase64);
    this.postService
      .createPost(post, this.imageToUploadBase64)
      .subscribe( () => {
        if (this.isCreated) {
          console.log('Created');
          this.message = this.response.data.message;
          createPostForm.reset();
          this.router.navigate(['/posts']);
          this.openSnackBar(this.snackBarMessage);
        } else {
          this.error = this.response.data.message;
          console.log('Error! ' + this.error);
          return false;
        }
      });
  }

  openSnackBar(message: string) {
    const config = new MatSnackBarConfig();
    config.panelClass = ['snackbar'];
    config.duration = this.snackbarDuration;
    this.snackBar.open(message, null, config);
  }

  ngOnDestroy(): void {
    this.responseSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
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
