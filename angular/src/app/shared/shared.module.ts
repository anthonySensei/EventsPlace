import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MatRadioModule, MatSnackBarModule} from '@angular/material';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';

import {NgxPaginationModule} from 'ngx-pagination';
import {ImageCropperModule} from 'ngx-image-cropper';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    MatMenuModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatRadioModule,
    NgxPaginationModule,
    ImageCropperModule
  ]
})

export class SharedModule {}
