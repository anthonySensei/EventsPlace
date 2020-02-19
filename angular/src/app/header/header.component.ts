import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {Subscription} from 'rxjs';
import {User} from '../user/user.model';
import {UserService} from '../user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  subscription: Subscription;
  userChangedSubscription: Subscription;
  user: User;
  role = 'user';

  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.subscription = this.authService.loggedChange
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      });
    this.userChangedSubscription = this.authService.userChanged
      .subscribe(user => {
        this.user = user;
        if (this.user) {
          this.role = this.user.role.role;
        } else {
          this.role = 'user';
        }
      });
  }

  onLogoutUser() {
    this.authService
      .logout()
      .subscribe(() => {
        if (this.isLoggedIn) {
          this.authService.setIsLoggedIn(false);
          this.router.navigate(['login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
