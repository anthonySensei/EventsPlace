import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {User} from '../user/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  loggedChange = new Subject<boolean>();
  user: User;
  userChanged = new Subject<User>();
  authJSONResponseChanged = new Subject<{}>();
  authJSONResponse = {};
  REGISTRATION_URL = 'http://localhost:3000/registration';
  LOGIN_URL = 'http://localhost:3000/login';
  LOGOUT_URL = 'http://localhost:3000/logout';

  constructor(private http: HttpClient) { }

  isAuthenticated() {
    const promise = new Promise(
      (resolve) => {
        resolve(this.isLoggedIn);
      }
    );
    return promise;
  }

  setUser(user: User) {
    this.user = user;
    this.userChanged.next(this.user);
  }

  getUser() {
    return this.user;
  }

  getIsLoggedIn() {
    return this.isLoggedIn;
  }

  setIsLoggedIn(isLoggedIn: boolean) {
    this.isLoggedIn = isLoggedIn;
    this.loggedChange.next(this.isLoggedIn);
  }

  setAuthJSONResponse(response) {
    this.authJSONResponse = response;
    this.authJSONResponseChanged.next(this.authJSONResponse);
  }

  registerUser(user) {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .post(
        this.REGISTRATION_URL,
        user,
        {headers})
      .pipe(map((response: any) => {
        this.setAuthJSONResponse(response);
        console.log(response);
      }));
  }



  login(user: { password: string; email: string }): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .post(
        this.LOGIN_URL,
        user,
        {headers})
      .pipe(map((response: any) => {
        this.setAuthJSONResponse(response);
        this.setUser(response.data.user);
      }));
  }

  logout() {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(
        this.LOGOUT_URL,
        {headers})
      .pipe(map((response: any) => {
        this.setAuthJSONResponse(response);
        this.setUser(null);
      }));
  }

}
