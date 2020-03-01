import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-activation-page',
  templateUrl: './activation-page.component.html',
  styleUrls: ['./activation-page.component.sass']
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
              private authService: AuthService) {
    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      this.registrationToken = params.rtoken;
    });
    console.log(this.registrationToken);
  }

  ngOnInit() {
    this.authSubscription = this.authService.checkRegistrationToken(this.registrationToken)
      .subscribe(() => {
        this.response = this.authService.getAuthJSONResponse();
        this.isActivated = this.response.data.isActivated;
        if (this.isActivated) {
          this.message = this.response.data.message;
        } else {
          this.error = this.response.data.message;
        }
      });
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
  }

}
