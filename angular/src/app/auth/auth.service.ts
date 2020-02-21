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

  isAdminRole = false;
  adminChange = new Subject<boolean>();

  isManagerRole = false;
  managerChange = new Subject<boolean>();

  user: User;
  userChanged = new Subject<User>();

  authJSONResponseChanged = new Subject<{}>();
  authJSONResponse = {};

  jwtTokenChanged = new Subject<string>();
  jwtToken: string;


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

  isAdmin() {
    const promise = new Promise(
      (resolve) => {
        resolve(this.isAdminRole);
      }
    );
    return promise;
  }

  isManager() {
    const promise = new Promise(
      (resolve) => {
        resolve(this.isManagerRole);
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

  setIsLoggedIn(isLoggedIn: boolean) {
    this.isLoggedIn = isLoggedIn;
    this.loggedChange.next(this.isLoggedIn);
  }

  getIsLoggedIn() {
    return this.isLoggedIn;
  }

  setIsAdmin(isAdmin: boolean) {
    this.isAdminRole = isAdmin;
    this.adminChange.next(this.isAdminRole);
  }

  setIsManager(isManager: boolean) {
    this.isManagerRole = isManager;
    this.managerChange.next(this.isManagerRole);
  }

  setAuthJSONResponse(response) {
    this.authJSONResponse = response;
    this.authJSONResponseChanged.next(this.authJSONResponse);
  }

  setJwtToken(token) {
    this.jwtToken = token;
    this.jwtTokenChanged.next(this.jwtToken);
  }

  getJwtToken(): string {
    return this.jwtToken;
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
        const userRole = this.user.role.role;
        if (userRole === 'admin') {
          this.setIsAdmin(true);
          this.setIsManager(true);
        } else if(userRole === 'manager') {
          this.setIsAdmin(false);
          this.setIsManager(true);
        } else {
          this.setIsAdmin(false);
          this.setIsManager(false);
        }
        this.setJwtToken(response.data.token);
        this.storeUser(response.data.token, response.data.user);
        console.log(response);
      }));
  }

  storeUser(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.jwtToken = token;
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
        localStorage.clear();
        this.setJwtToken(null);
      }));
  }

}
