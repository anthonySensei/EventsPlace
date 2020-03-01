import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import {DialogData} from '../create-post.component';

@Component({
  selector: 'app-dialog',
  templateUrl: './choose-image-modal.component.html'
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
