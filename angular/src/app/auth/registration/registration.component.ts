import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, NgForm, NgModel, Validators} from '@angular/forms';
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

  isPasswordError = false;
  isEmailError = false;
  created = false;

  JSONSubscription: Subscription;

  emailValidation = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

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
      password: new FormControl(null, [Validators.required]),
      password2: new FormControl(null, [Validators.required])
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


  onRegisterUser() {
    const email = this.regForm.value.email;
    const password = this.regForm.value.password;
    const password2 = this.regForm.value.password2;

    const user = {
      email,
      password
    };

    if (!this.checkFormService.comparePasswords(password, password2)) {
      this.isPasswordError = true;
      this.isEmailError = false;
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
          this.isEmailError = true;
          this.isPasswordError = false;
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
