import { Injectable } from '@angular/core';

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  CREATING_POST_URL = 'http://localhost:3000/create-post';
  responseChanged = new Subject();
  response;

  constructor(private http: HttpClient) { }

  getResponse() {
    return this.response;
  }

  setResponse(response) {
    this.response = response;
    this.responseChanged.next(this.response);
  }

  createPost(post) {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .post(
        this.CREATING_POST_URL,
        post,
        {headers})
      .pipe(map((response: any) => {
        this.setResponse(response);
      }));
  }
}
