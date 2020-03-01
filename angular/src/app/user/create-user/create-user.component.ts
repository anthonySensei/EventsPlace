import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {AuthService} from '../../auth/auth.service';
import {ValidationService} from '../../validation.service';
import {MaterialService} from '../../shared/material.service';

import {Observable, Subject, Subscription} from 'rxjs';

import {SnackBarClassesEnum} from '../../shared/snackBarClasses.enum';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html'
})
export class CreateUserComponent implements OnInit, OnDestroy {
  createUserForm: FormGroup;

  isCreated: boolean;
  JSONSubscription: Subscription;
  error: string = null;
  message: string = null;

  snackbarDuration = 5000;

  emailValidation;

  isDone = false;

  discard = false;
  discardChanged = new Subject<boolean>();

  constructor(private authService: AuthService,
              private router: Router,
              private materialService: MaterialService,
              private validationService: ValidationService) { }

  ngOnInit() {
    this.emailValidation = this.validationService.getEmailValidation();
    this.createUserForm = new FormGroup({
      email: new FormControl(
        null,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(this.emailValidation)
        ]
      ),
      userRole: new FormControl(null, [Validators.required])
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
          this.isCreated = JSONResponse.data.created;
        }
      );
  }

  onCreateUser() {
    const email = this.createUserForm.value.email;
    const userRole = this.createUserForm.value.userRole;
    if (this.createUserForm.invalid) {
      return;
    }
    if (!this.emailValidation.test(email)) {
      return;
    }
    const user = {email, userRole};
    console.log(user);
    this.authService.registerUser(user)
      .subscribe(() => {
        if (this.isCreated === false) {
          this.isDone = false;
          this.error = this.message;
          this.createUserForm.controls.email.setErrors({incorrect: true});
        } else {
          this.isDone = true;
          this.router.navigate(['/users']);
          this.openSnackBar(this.message, SnackBarClassesEnum.Success, this.snackbarDuration);
        }
      });
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.createUserForm.touched && !this.isDone) {
      this.materialService.openDiscardChangesDialog(this.discard, this.discardChanged);
      return this.discardChanged;
    } else {
      return true;
    }
  }

  hasError(controlName: string, errorName: string) {
    return this.createUserForm.controls[controlName].hasError(errorName);
  }

  openSnackBar(message: string, style: string, duration: number) {
    this.materialService.openSnackBar(message, style, duration);
  }

  ngOnDestroy(): void {
    this.JSONSubscription.unsubscribe();
  }
}
