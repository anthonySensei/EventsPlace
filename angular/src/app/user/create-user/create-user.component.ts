import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgModel} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit, OnDestroy {
  isEmailError: boolean;
  userRole: string;
  isCreated: boolean;
  JSONSubscription: Subscription;
  error: string = null;
  message: string = null;

  snackbarDuration = 5000;

  constructor(private authService: AuthService,
              private router: Router,
              private snackBar: MatSnackBar) { }

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
          this.isCreated = JSONResponse.data.created;
        }
      );
  }

  onCreateUser(email: NgModel, userRole: string) {
    const user = {
      email: email.value,
      userRole
    };
    console.log(user);
    this.authService.registerUser(user)
      .subscribe(() => {
        if (this.isCreated === false) {
          this.isEmailError = true;
          this.error = this.message;
          console.log(this.error);
        } else {
          this.router.navigate(['users']);
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
