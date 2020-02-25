import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CheckFormService} from '../check-form.service';
import {Router} from '@angular/router';
import {FormControl, FormGroup, NgForm, NgModel, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {AuthService} from '../auth.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;

  error: string = null;
  message: string = null;

  loggedIn = false;

  JSONSubscription: Subscription;

  snackbarDuration = 5000;

  emailValidation = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  // passwordValidation = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

  constructor(private checkFormService: CheckFormService,
              private authService: AuthService,
              private router: Router,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required])
    });
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

  hasError(controlName: string, errorName: string) {
    return this.loginForm.controls[controlName].hasError(errorName);
  }

  onLoginUser() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    if (email === '' || password === '') {
      return false;
    }
    if (!this.emailValidation.test(email)) {
      return false;
    }
    // if (!this.passwordValidation.test(email)) {
    //   return false;
    // }
    const user = {
      email,
      password
    };
    this.authService
      .login(user)
      .subscribe(() => {
        if (!this.loggedIn) {
          this.loginForm.patchValue({
            email,
            password: ''
          });
          this.error = this.message;
          return false;
        } else {
          this.authService.setIsLoggedIn(this.loggedIn);
          this.router.navigate(['posts']);
          this.loginForm.reset();
          this.message = 'You was logged in successfully';
          this.openSnackBar(this.message, null);
        }
      });
  }

  openSnackBar(message: string, action: string) {
    const config = new MatSnackBarConfig();
    config.panelClass = ['snackbar'];
    config.duration = this.snackbarDuration;
    this.snackBar.open(message, action, config);
  }

  ngOnDestroy(): void {
    this.JSONSubscription.unsubscribe();
  }

}
