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
  GET_POSTS_URL = 'http://localhost:3000/posts';
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

  constructor(private http: HttpClient) { }

  fetchAllPosts() {
    const headers = new HttpHeaders();
    headers.append('Content-type', 'application/json');
    return this
      .http
      .get(this.GET_POSTS_URL, {headers})
      .pipe(map((response: any) => {
        this.setPosts(response.data.posts);
        console.log(response.data.posts);
      }));
  }

  setPostStatus(post: Post, reason?: string) {
    console.log(post);
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
