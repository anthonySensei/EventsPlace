import {Component, Inject} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {RejectedDeletedReasonDialogDataModel} from './rejected-deleted-reason-dialog-data.model';

@Component({
  selector: 'app-rejected-dialog-reason-dialog',
  templateUrl: './rejected-deleted-reason-modal.html',
  styleUrls: ['../post-details.component.sass']
})
export class RejectedDeletedReasonModalComponent {

  constructor(
    public dialogRef: MatDialogRef<RejectedDeletedReasonModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectedDeletedReasonDialogDataModel) {
    dialogRef.disableClose = true;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
