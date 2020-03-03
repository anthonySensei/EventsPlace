import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {Subscription} from 'rxjs';
import {MaterialService} from '../../shared/material.service';
import {SnackBarClassesEnum} from '../../shared/snackBarClasses.enum';

@Component({
  selector: 'app-activation-page',
  templateUrl: './activation-page.component.html'
})
export class ActivationPageComponent implements OnInit, OnDestroy {
  registrationToken: string = null;

  paramsSubscription: Subscription;
  authSubscription: Subscription;

  response;
  isActivated: boolean;

  message;
  error;


  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private router: Router,
              private materialService: MaterialService) {
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      this.registrationToken = params.rtoken;
    });
  }

  ngOnInit() {
    this.authSubscription = this.authService.checkRegistrationToken(this.registrationToken)
      .subscribe(() => {
        this.response = this.authService.getAuthJSONResponse();
        this.isActivated = this.response.data.isActivated;
        if (this.isActivated) {
          this.message = this.response.data.message;
          this.openSnackBar(this.response.data.message, SnackBarClassesEnum.Success, 5000);
          this.router.navigate(['/login']);
        } else {
          this.error = this.response.data.message;
          this.openSnackBar(this.response.data.message, SnackBarClassesEnum.Danger, 5000);
        }
      });
  }

  openSnackBar(message: string, style: string, duration: number) {
    this.materialService.openSnackBar(message, style, duration);
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
  }

}
