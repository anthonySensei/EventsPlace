import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {Observable, Subject, Subscription} from 'rxjs';

import {AuthService} from '../auth.service';
import {ValidationService} from '../../validation.service';
import {MaterialService} from '../../shared/material.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['../login/auth.component.sass']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  regForm: FormGroup;

  error: string = null;
  message: string = null;

  created = false;

  JSONSubscription: Subscription;

  emailValidation;
  passwordValidation;

  hidePassword = true;
  hideRetypePassword = true;

  isPasswordError = false;

  isDone = false;

  discard = false;
  discardChanged = new Subject<boolean>();


constructor(private validationService: ValidationService,
            private authService: AuthService,
            private materialService: MaterialService,
            private router: Router) {
  }

  ngOnInit() {
    this.emailValidation = this.validationService.getEmailValidation();
    this.passwordValidation = this.validationService.getPasswordValidation();
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

    if (this.regForm.invalid) {
      return;
    }

    const user = {
      email,
      password
    };

    console.log(user);

    if (!this.validationService.comparePasswords(password, password2)) {
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
          this.isDone = true;
          this.isPasswordError = false;
          this.regForm.patchValue({
            password: '',
            password2: ''
          });
          this.regForm.controls.email.setErrors({incorrect: true});
          this.error = this.message;
          console.log(this.error);
        } else {
          this.isDone = false;
          this.router.navigate(['/login']);
        }
      });
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.regForm.touched && !this.isDone) {
      this.materialService.openDiscardChangesDialog(this.discard, this.discardChanged);
      return this.discardChanged;
    } else {
      return true;
    }
  }

  ngOnDestroy(): void {
    this.JSONSubscription.unsubscribe();
  }

}
