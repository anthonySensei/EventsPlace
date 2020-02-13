import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CheckFormService} from '../check-form.service';
import {Router} from '@angular/router';
import {NgForm, NgModel} from '@angular/forms';
import {Subscription} from 'rxjs';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  @ViewChild('loginForm', {static: false}) loginForm: NgForm;
  error: string = null;
  message: string = null;
  loggedIn = false;
  JSONSubscription: Subscription;

  constructor(private checkFormService: CheckFormService,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.JSONSubscription = this.authService.authJSONResponseChanged
      .subscribe(
        (JSONResponse: {
          responseCode: number,
          data: {
            loggedIn: boolean,
            message: string
          }
        }) => {
          this.message = JSONResponse.data.message;
          this.loggedIn = JSONResponse.data.loggedIn;
        }
      );
  }


  onLoginUser(email: NgModel, password: NgModel) {
    if (email.value === '' && password.value === '') {
      this.error = 'Please fill in fields';
      this.loginForm.reset();
      return false;
    }
    const user = {
      email: email.value,
      password: password.value
    };
    this.authService
      .login(user)
      .subscribe(() => {
        console.log(this.loggedIn);
        if (!this.loggedIn) {
          this.error = this.message;
          this.loginForm.setValue({
            email: email.value,
            password: ''
          });
          return false;
        } else {
          this.authService.setIsLoggedIn(this.loggedIn);
          this.router.navigate(['posts']);
          this.loginForm.reset();
        }
      });
  }

  ngOnDestroy(): void {
    this.JSONSubscription.unsubscribe();
  }

}
