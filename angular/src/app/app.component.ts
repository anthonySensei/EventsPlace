import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

import {AuthService} from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    console.log('App component');
    this.authService.autoLogin();
    this.authService.loggedChange.subscribe();
  }

}
