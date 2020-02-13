import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CheckFormService} from '../check-form.service';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NgForm, NgModel} from '@angular/forms';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['../login/auth.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  @ViewChild('regForm', {static: false}) regForm: NgForm;
  error: string = null;
  message: string = null;
  isPasswordError = false;
  isEmailError = false;
  created = false;
  JSONSubscription: Subscription;

  constructor(private checkFormService: CheckFormService,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
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


  onRegisterUser(email: NgModel, password: NgModel, password2: NgModel) {
      const user = {
        email: email.value,
        password: password.value
      };

      if (!this.checkFormService.comparePasswords(password.value, password2.value)) {
        this.isPasswordError = true;
        this.isEmailError = false;
        this.error = 'Passwords are different';
        this.regForm.setValue({
          email: email.value,
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
