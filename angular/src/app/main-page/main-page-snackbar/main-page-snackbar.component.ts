import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material';

@Component({
  selector: 'app-snackbar',
  templateUrl: './main-page-snackbar.component.html',
  styleUrls: ['../main-page.component.css']
})
export class MainPageSnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<MainPageSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
