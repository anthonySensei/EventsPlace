import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {User} from './user.model';

import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  UPDATE_USER_DATA_URL = 'http://localhost:3000/my-account';
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

  constructor(private http: HttpClient) {}

  setResponse(response) {
    this.response = response;
    this.responseChanged.next(this.response);
  }

  getResponse() {
    return this.response;
  }

  updateUserData(user: User, changed: string, passwordObject?) {
    console.log(user);
    const headers = new HttpHeaders();
    this.request.user = user;
    if (changed === 'info') {
      this.request.changeData.changeInfo = true;
      this.request.changeData.changeImage = false;
      this.request.changeData.changePassword = false;
    } else if (changed === 'password') {
      this.request.passwordObject = passwordObject;
      this.request.changeData.changeInfo = false;
      this.request.changeData.changeImage = false;
      this.request.changeData.changePassword = true;
    }
    headers.append('Content-type', 'application/json');
    return this
      .http
      .post(
        this.UPDATE_USER_DATA_URL,
        this.request,
        {headers})
      .pipe(map((response) => {
          this.setResponse(response);
      }));
  }
}
