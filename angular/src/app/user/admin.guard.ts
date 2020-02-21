import {ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {AuthService} from '../auth/auth.service';

@Injectable({
providedIn: 'root'
})
export class AdminGuard implements CanActivate {
constructor(private authService: AuthService,
            private router: Router) {
}

canActivate(
route: ActivatedRouteSnapshot,
state: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAdmin()
    .then(
      (admin: boolean) => {
        if (admin) {
          return true;
        } else {
          this.router.navigate(['/posts']);
          return false;
        }
      }
    );
}

}
