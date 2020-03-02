import {Injectable} from '@angular/core';

import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {MatDialog} from '@angular/material/dialog';

import {Subject} from 'rxjs';

import {DiscardChangesModalComponent} from './discard-changes-modal/discard-changes-modal.component';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  changeDiscardModalWidth = '50%';

  constructor(private snackBar: MatSnackBar,
              public dialog: MatDialog,
              private breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.XSmall
    ]).subscribe(result => {
      if (result.matches) {
        this.changeDiscardModalWidth = '95%';
      }
    });
    breakpointObserver.observe([
      Breakpoints.Medium,
      Breakpoints.Tablet
    ]).subscribe(result => {
      if (result.matches) {
        this.changeDiscardModalWidth = '85%';
      }
    });
  }

  public openSnackBar(message: string, snackBarClass: string, duration: number) {
    const config = new MatSnackBarConfig();
    config.panelClass = [snackBarClass];
    config.duration = duration;
    this.snackBar.open(message, null, config);
  }

  openDiscardChangesDialog(discard: boolean, discardChanged: Subject<boolean>) {
    const dialogRef = this.dialog.open(DiscardChangesModalComponent, {
      width: this.changeDiscardModalWidth
  });

    dialogRef.afterClosed().subscribe(result => {
      discard = result;
      discardChanged.next(discard);
    });
  }
}
