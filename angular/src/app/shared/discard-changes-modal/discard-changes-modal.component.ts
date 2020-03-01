import {Component, Inject} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-discard-changes',
  templateUrl: './discard-changes-modal.html'
})
export class DiscardChangesModalComponent {

  constructor(
    public dialogRef: MatDialogRef<DiscardChangesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: null) {
    dialogRef.disableClose = true;
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }



}
