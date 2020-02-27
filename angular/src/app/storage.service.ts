import {Injectable} from '@angular/core';

import {HttpClient, HttpHeaders} from '@angular/common/http';

import {map} from 'rxjs/operators';
import {Post} from './main-page/post.model';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  responseChanged = new Subject();
  response;
  postsChanged = new Subject<Post[]>();
  posts: Post[] = [];
  GET_ALL_POSTS_URL = 'http://localhost:3000/posts-managing';
  GET_APPROVED_POSTS_URL = 'http://localhost:3000/posts';
  SET_STATUS_URL = 'http://localhost:3000/set-status';

  setPosts(posts: Post[]) {
    this.posts = posts;
    this.postsChanged.next(posts);
  }

  getPosts() {
    return this.posts;
  }

  getPost(postId: number) {
    return this.posts[postId - 1];
  }

  setResponse(response) {
    this.response = response;
    this.responseChanged.next(this.response);
  }

  getResponse() {
    return this.response;
  }

  constructor(private http: HttpClient) { }

  fetchApprovedPosts(filter: string, value: string, dateObj, page: number) {
    let fromDate;
    let toDate;
    if (dateObj.fromDate) {
      fromDate = dateObj.fromDate;
    } else {
      fromDate = '';
    }
    if (dateObj.toDate) {
      toDate = dateObj.toDate;
    } else {
      toDate = '';
    }
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(
        `${this.GET_APPROVED_POSTS_URL}?filter=${filter}&value=${value}&page=${page}&fDate=${fromDate}&tDate=${toDate}`,
        {headers})
      .pipe(map((response: any) => {
        this.setPosts(response.data.posts);
        this.setResponse(response);
      }));
  }

  fetchAllPosts(status: string, page: number) {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(
        `${this.GET_ALL_POSTS_URL}?status=${status}&page=${page}`,
        {headers})
      .pipe(map((response: any) => {
        this.setPosts(response.data.posts);
        this.setResponse(response);
      }));
  }

  setPostStatus(post: Post, reason?: string) {
    post.postImage = '';
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .post(
        this.SET_STATUS_URL,
        post,
        {headers})
      .pipe(map((response: any) => {
        this.setResponse(response);
      }));
  }



}
