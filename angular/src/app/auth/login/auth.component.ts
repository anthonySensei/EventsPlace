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

  constructor(private checkFormService: CheckFormService,
              private authService: AuthService,
              private router: Router,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [Validators.required])
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


  onLoginUser() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    if (email === '' || password === '') {
      this.error = 'Please fill in fields';
      this.loginForm.reset();
      return false;
    }
    const user = {
      email,
      password
    };
    this.authService
      .login(user)
      .subscribe(() => {
        if (!this.loggedIn) {
          this.error = this.message;
          this.loginForm.patchValue({
            email,
            password: ''
          });
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
