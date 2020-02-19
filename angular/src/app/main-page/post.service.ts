import {Injectable} from '@angular/core';

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Post} from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  GET_POST_URL = 'http://localhost:3000/post-details';
  CREATING_POST_URL = 'http://localhost:3000/create-post';
  responseChanged = new Subject();
  response;
  postChanged = new Subject<Post>();
  post: Post;

  constructor(private http: HttpClient) {}

  setPost(post: Post) {
    this.post = post;
    this.postChanged.next(post);
  }

  getPost() {
    return this.post;
  }

  getResponse() {
    return this.response;
  }

  setResponse(response) {
    this.response = response;
    this.responseChanged.next(this.response);
  }

  getPostHttp(postId: number) {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(this.GET_POST_URL + '?postId=' + postId,
        {headers})
      .pipe(map((response: any) => {
        this.setPost(response.data.post);
      }));
  }

  createPost(post, ImageBase64ToUpload: string) {
    const headers = new HttpHeaders();
    const formData: FormData = new FormData();
    headers.append('Content-Type', 'multipart/form-data');
    formData.append('base64', ImageBase64ToUpload);
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
