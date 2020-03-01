import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {ImageCroppedEvent} from 'ngx-image-cropper';

import {ChangeProfileImageDialogData} from './change-profile-image-dialog-data.model';

@Component({
  selector: 'app-change-profile-image-dialog',
  templateUrl: './change-profile-image-modal.html',
  styleUrls: ['../user.component.sass']
})
export class ChangeProfileImageModalComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor(
    public dialogRef: MatDialogRef<ChangeProfileImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeProfileImageDialogData) {
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
