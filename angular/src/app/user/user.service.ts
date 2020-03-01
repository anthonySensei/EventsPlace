import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {User} from './user.model';

import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  USER_DATA_URL = 'http://localhost:3000/my-account';
  UPDATE_PROFILE_IMAGE_URL = 'http://localhost:3000/my-account/update-profile-image';
  GET_USERS_URL = 'http://localhost:3000/users';

  request = {
    user: null,
    changeData: {
      changePassword: false,
      changeInfo: false,
      changeImage: false
    },
    passwordObject: {
      oldPassword: '',
      newPassword: '',
      retypeNewPassword: ''
    }
  };

  response;
  responseChanged = new Subject();

  users: User[] = [];
  usersChanged = new Subject<User[]>();

  constructor(private http: HttpClient,
              private authService: AuthService) {}

  setResponse(response) {
    this.response = response;
    this.responseChanged.next(this.response);
  }

  getResponse() {
    return this.response;
  }

  setUsers(users: User[]) {
    this.users = users;
    this.usersChanged.next(this.users);
  }

  getUsers(): User[] {
    return this.users;
  }

  updateUserData(user: User, changed: string, passwordObject?) {
    const headers = new HttpHeaders();
    if (changed === 'info') {
      this.request.changeData.changeInfo = true;
      this.request.changeData.changeImage = false;
      this.request.changeData.changePassword = false;
      this.request.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };
    } else if (changed === 'password') {
      this.request.passwordObject = passwordObject;
      this.request.user = {
        id: user.id
      };
      this.request.changeData.changeInfo = false;
      this.request.changeData.changeImage = false;
      this.request.changeData.changePassword = true;
    }
    headers.append('Content-type', 'application/json');
    return this
      .http
      .post(
        this.USER_DATA_URL,
        this.request,
        {headers})
      .pipe(map((response) => {
          this.setResponse(response);
      }));
  }

  updateProfileImage(base64Image: string, user: User) {
    const headers = new HttpHeaders();
    const formData: FormData = new FormData();
    headers.append('Content-Type', 'multipart/form-data');
    formData.append('base64', base64Image);
    formData.append('user', JSON.stringify(user));
    return this
      .http
      .post(
        this.UPDATE_PROFILE_IMAGE_URL,
        formData,
        {headers})
      .pipe(map((response: any) => {
        this.setResponse(response);
      }));
  }

  getUserHttp(userEmail: string) {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(
        this.USER_DATA_URL + '?email=' + userEmail,
        {headers})
      .pipe(map((response: any) => {
        this.authService.setUser(response.data.user);
      }));
  }

  getUsersHttp() {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(
        this.GET_USERS_URL,
        {headers})
      .pipe(map((response: any) => {
         this.setUsers(response.data.users);
         console.log(response);
      }));
  }
}
