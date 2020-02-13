import {NgModel, Validators} from '@angular/forms';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

import {UserService} from './user.service';
import {AuthService} from '../auth/auth.service';

import {User} from './user.model';

import {Subscription} from 'rxjs';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';


export interface DialogData {
  name: string;
  oldPassword: string;
  newPassword: string;
  retypeNewPassword: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  user: User;
  userSubscription: Subscription;
  responseSubscription: Subscription;
  error: string;
  response;
  message;

  name: string;
  oldPassword: string;
  newPassword: string;
  retypeNewPassword: string;

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
    this.responseSubscription = this.userService.responseChanged
      .subscribe(response => {
        this.response = response;
      });
    this.response = this.userService.getResponse();
    this.name = this.user.name;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ModalDialogComponent, {
      width: '35%',
      data: {
        name: this.name,
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
        retypeNewPassword: this.retypeNewPassword}
    });

    dialogRef.afterClosed().subscribe(result => {
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
      user_id: this.user.userId,
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

@Component({
  selector: 'app-dialog',
  templateUrl: 'change-password-modal.html',
  styleUrls: ['./user.component.css']
})
export class ModalDialogComponent {
  hideOldPassword = true;
  hideNewPassword = true;
  hideRetypePassword = true;

  constructor(
    public dialogRef: MatDialogRef<ModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    dialogRef.disableClose = true;
  }

  checkIcon(password: string, hide: boolean) {
    if (password == null || password === '') {
      return '';
    } else if (hide) {
      return 'visibility';
    } else {
      return 'visibility_off';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
