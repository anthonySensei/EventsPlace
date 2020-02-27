import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {map} from 'rxjs/operators';
import {Subject} from 'rxjs';

import {Post} from './post.model';
import {Hashtag} from './hashtag.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  GET_POST_URL = 'http://localhost:3000/post-details';
  GET_HASHTAGS_URL = 'http://localhost:3000/hashtags';
  CREATING_POST_URL = 'http://localhost:3000/create-post';
  UPDATE_POST_URL = 'http://localhost:3000/update-post';

  responseChanged = new Subject();
  response;

  postChanged = new Subject<Post>();
  post: Post;

  hashtagsChanged = new Subject<Hashtag[]>();
  hashtags: Hashtag[];

  constructor(private http: HttpClient) {}

  setPost(post: Post) {
    this.post = post;
    this.postChanged.next(post);
  }

  getPost() {
    return this.post;
  }

  setHashtags(hashtags: Hashtag[]) {
    this.hashtags = hashtags;
    this.hashtagsChanged.next(this.hashtags);
  }

  getHashtags(): Hashtag[] {
    return this.hashtags;
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

  updatePost(postId: number, post, imageToUploadBase64: string) {
    const headers = new HttpHeaders();
    const formData: FormData = new FormData();
    const postData = {
      id: postId,
      ...post
    };
    headers.append('Content-Type', 'multipart/form-data');
    formData.append('base64', imageToUploadBase64);
    formData.append('post_data', JSON.stringify(postData));
    return this
      .http
      .put(
        this.UPDATE_POST_URL,
        formData,
        {headers})
      .pipe(map((response: any) => {
        this.setResponse(response);
      }));
  }

  getHashtagsHttp() {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(this.GET_HASHTAGS_URL, {headers})
      .pipe(map((response: any) => {
        this.setHashtags(response.data.hashtags);
      }));
  }
}
