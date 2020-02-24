import {NgModel} from '@angular/forms';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

import {UserService} from './user.service';
import {AuthService} from '../auth/auth.service';

import {User} from './user.model';

import {Subscription} from 'rxjs';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {ChangePasswordModalComponent} from './change-password-modal/change-password-modal.component';
import {ChangeProfileImageModalComponent} from './change-profile-image/change-profile-image-modal.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  user: User;
  userSubscription: Subscription;
  getUserSubscription: Subscription;
  responseSubscription: Subscription;
  error: string;
  response;
  message;

  name: string;
  oldPassword: string;
  newPassword: string;
  retypeNewPassword: string;

  profileImageBase64;

  snackbarDuration = 5000;


  constructor(private authService: AuthService,
              private userService: UserService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.userSubscription = this.authService.userChanged
      .subscribe(user => {
        this.user = user;
        this.isLoading = false;
      });
    this.user = this.authService.getUser();
    this.getUserSubscription = this.userService.getUserHttp(this.user.email).subscribe();
    // console.log(this.user.profile_image);
    this.responseSubscription = this.userService.responseChanged
      .subscribe(response => {
        this.response = response;
      });
    this.response = this.userService.getResponse();
    this.name = this.user.name;
    if (!this.name) {
      this.name = '';
    }
  }

  openChangeProfileImageDialog() {
    const dialogRef = this.dialog.open(ChangeProfileImageModalComponent, {
      width: '70%',
      data: {
        imageBase64: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.profileImageBase64 = result;
      if (this.profileImageBase64) {
        this.onChangeProfileImage(this.profileImageBase64);
      }
    });
  }

  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '35%',
      data: {
        name: this.name,
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
        retypeNewPassword: this.retypeNewPassword
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return false;
      }
      this.onChangeUserPassword(
        result.oldPassword,
        result.newPassword,
        result.retypeNewPassword
      );
    });
  }

  onChangeUserData(name: NgModel, email: NgModel) {
    this.user.email = email.value;
    this.user.name = name.value;
    this.userService.updateUserData(this.user, 'info')
      .subscribe(() => {
        if (this.response.data.changedUserInfo) {
          this.message = this.response.data.message;
          this.openSnackBar(this.message, null);
        }
      });
  }

  onChangeUserPassword(
    oldPassword: string,
    newPassword: string,
    retypeNewPassword: string) {
    const passwordsObject = {
      user_id: this.user.id,
      oldPassword,
      newPassword,
      retypeNewPassword
    };
    this.userService.updateUserData(this.user, 'password', passwordsObject)
      .subscribe(() => {
        if (this.response.data.passwordChanged) {
          this.message = this.response.data.message;
          this.openSnackBar(this.message, null);
        } else {
          this.error = this.response.data.message;
        }
      });
  }

  onChangeProfileImage(base64Image: string) {
    // console.log(base64Image);
    this.userService.updateProfileImage(base64Image, this.user)
      .subscribe(() => {
        this.message = this.userService.getResponse().data.message;
        this.openSnackBar(this.message, null);
      });
  }

  openSnackBar(message: string, action: string) {
    const config = new MatSnackBarConfig();
    config.panelClass = ['snackbar'];
    config.duration = this.snackbarDuration;
    this.snackBar.open(message, action, config);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
