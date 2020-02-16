import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm, NgModel} from '@angular/forms';
import {PostService} from '../post.service';
import {User} from '../../user/user.model';
import {Hashtag} from '../hashtag.model';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

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

  fileToUpload: File = null;

  constructor(private postService: PostService,
              private authService: AuthService,
              private router: Router,
              public snackBar: MatSnackBar) {}

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

  onHandleFileInput(event) {
    this.fileToUpload = event.target.files[0];
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
    console.log(this.fileToUpload);
    this.postService
      .createPost(post, this.fileToUpload)
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
