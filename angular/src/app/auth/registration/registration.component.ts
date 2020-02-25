import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {Subscription} from 'rxjs';

import {AuthService} from '../auth.service';
import {CheckFormService} from '../check-form.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['../login/auth.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  regForm: FormGroup;

  error: string = null;
  message: string = null;

  created = false;

  JSONSubscription: Subscription;

  emailValidation = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  passwordValidation = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

  hidePassword = true;
  hideRetypePassword = true;

  isPasswordError = false;


constructor(private checkFormService: CheckFormService,
            private authService: AuthService,
            private router: Router) {
  }

  ngOnInit() {
    this.regForm = new FormGroup({
      email: new FormControl(
        null,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(this.emailValidation)
        ]
      ),
      password: new FormControl(
        null, [
          Validators.required,
          Validators.pattern(this.passwordValidation)
        ]
      ),
      password2: new FormControl(
        null, [
          Validators.required,
          Validators.pattern(this.passwordValidation)
        ]
      )
    });
    this.JSONSubscription = this.authService.authJSONResponseChanged
      .subscribe(
        (JSONResponse: {
          responseCod: string;
          data: {
            created: boolean,
            message: string
          }
        }) => {
          this.message = JSONResponse.data.message;
          this.created = JSONResponse.data.created;
        }
      );
  }

  hasError(controlName: string, errorName: string) {
    return this.regForm.controls[controlName].hasError(errorName);
  }

  checkIcon(hide: boolean, password: string) {
    if (password == null || password === '') {
      return '';
    } else if (hide) {
      return 'visibility';
    } else {
      return 'visibility_off';
    }
  }


  onRegisterUser() {
    const email = this.regForm.value.email;
    const password = this.regForm.value.password;
    const password2 = this.regForm.value.password2;

    if (email === '' || password === '' || password2 === '') {
      return false;
    }

    if (!this.emailValidation.test(email)) {
      return false;
    }

    if (!this.passwordValidation.test(password) || !this.passwordValidation.test(password2)) {
      return false;
    }

    const user = {
      email,
      password
    };

    if (!this.checkFormService.comparePasswords(password, password2)) {
      this.isPasswordError = true;
      this.error = 'Passwords are different';
      this.regForm.patchValue({
        email,
        password: '',
        password2: ''
      });
      return false;
    }

    this.authService
      .registerUser(user)
      .subscribe(() => {
        if (this.created === false) {
          this.isPasswordError = false;
          this.regForm.patchValue({
            password: '',
            password2: ''
          });
          this.regForm.controls.email.setErrors({incorrect: true});
          this.error = this.message;
          console.log(this.error);
        } else {
          this.router.navigate(['login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.JSONSubscription.unsubscribe();
  }

}
