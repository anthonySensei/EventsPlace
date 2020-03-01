import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

import {AuthService} from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.autoLogin();
    this.authService.loggedChange.subscribe();
  }

}
