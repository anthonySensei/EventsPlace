import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import {AuthService} from '../auth/auth.service';
import {UserService} from '../user/user.service';

import {User} from '../user/user.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isSmallScreen = false;

  userChangedSubscription: Subscription;
  breakpointSubscription: Subscription;
  authServiceSubscription: Subscription;

  user: User;

  role = 'user';



  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router,
              private breakpointObserver: BreakpointObserver) {
    this.breakpointSubscription = breakpointObserver.observe([
      Breakpoints.Small,
      Breakpoints.XSmall
    ]).subscribe(result => {
      if (result.matches) {
        this.isSmallScreen = true;
      } else if (!result.matches) {
        this.isSmallScreen = false;
      }
    });
  }

  ngOnInit() {
    this.authService.autoLogin();
    this.userChangedSubscription = this.authService.userChanged
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.user = user;
        if (this.user) {
          this.role = this.user.role.role;
        } else {
          this.role = 'user';
        }
      });
  }

  onLogoutUser() {
    this.authServiceSubscription = this.authService
      .logout()
      .subscribe(() => {
        if (this.isLoggedIn) {
          this.authService.setIsLoggedIn(false);
          this.router.navigate(['login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.authServiceSubscription.unsubscribe();
    this.breakpointSubscription.unsubscribe();
    this.userChangedSubscription.unsubscribe();
  }
}
