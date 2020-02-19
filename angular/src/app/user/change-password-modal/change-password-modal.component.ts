import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ChangePasswordDialogData} from './change-password-dialog-data.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './change-password-modal.html',
  styleUrls: ['../user.component.css']
})
export class ChangePasswordModalComponent {
  hideOldPassword = true;
  hideNewPassword = true;
  hideRetypePassword = true;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData) {
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
