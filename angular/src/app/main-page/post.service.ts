import {Injectable} from '@angular/core';

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {json} from 'sequelize';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  CREATING_POST_URL = 'http://localhost:3000/create-post';
  responseChanged = new Subject();
  response;

  constructor(private http: HttpClient) {
  }

  getResponse() {
    return this.response;
  }

  setResponse(response) {
    this.response = response;
    this.responseChanged.next(this.response);
  }

  createPost(post, fileToUpload: File) {
    const headers = new HttpHeaders();
    const formData: FormData = new FormData();
    headers.append('Content-Type', 'multipart/form-data');
    formData.append('image', fileToUpload, fileToUpload.name);
    formData.append('post_data', JSON.stringify(post));
    return this
      .http
      .post(
        this.CREATING_POST_URL,
        formData,
        {headers})
      .pipe(map((response: any) => {
        this.setResponse(response);
      }));
  }
}
