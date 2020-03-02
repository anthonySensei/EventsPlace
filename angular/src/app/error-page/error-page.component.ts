import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.sass']
})
export class ErrorPageComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.autoLogin();
  }

}
