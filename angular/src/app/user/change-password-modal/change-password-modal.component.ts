import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {ChangePasswordDialogData} from './change-password-dialog-data.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './change-password-modal.html',
  styleUrls: ['../user.component.css']
})
export class ChangePasswordModalComponent implements OnInit {
  passwordsForm: FormGroup;

  hideOldPassword = true;
  hideNewPassword = true;
  hideRetypePassword = true;

  oldPassword: string;
  newPassword: string;
  retypeNewPassword: string;


  passwordValidation = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

  error: string;
  message: string;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.passwordsForm = new FormGroup({
      oldPassword: new FormControl(
        null,
        [
          Validators.required
        ]
      ),
      newPassword: new FormControl(
        null, [
          Validators.required,
          Validators.pattern(this.passwordValidation)
        ]
      ),
      retypeNewPassword: new FormControl(
        null, [
          Validators.required,
          Validators.pattern(this.passwordValidation)
        ]
      )
    });
  }

  onChangeUserPassword() {
    const oldPassword = this.passwordsForm.value.oldPassword;
    const newPassword = this.passwordsForm.value.newPassword;
    const retypeNewPassword = this.passwordsForm.value.retypeNewPassword;
    if (oldPassword || newPassword || retypeNewPassword) {
      this.error = 'Please fill in fields';
    }
    this.data.newPassword = newPassword;
    this.data.oldPassword = oldPassword;
    this.data.retypeNewPassword = retypeNewPassword;
    this.dialogRef.close(this.data);
  }

  checkIcon(hide: boolean, password: string) {
    if (password == null || password === '') {
      return '';
    } else if (hide) {
      return 'visibility';
    } else {
      return 'visibility_off';
    }
  }

  hasError(controlName: string, errorName: string) {
    return this.passwordsForm.controls[controlName].hasError(errorName);
  }

  onNoClick(): void {
    this.dialogRef.close('nothing');
  }



}
