import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm, NgModel} from '@angular/forms';
import {PostService} from '../post.service';
import {User} from '../../user/user.model';
import {Hashtag} from '../hashtag.model';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {Role} from '../../user/role.model';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['../../auth/login/auth.component.css']
})
export class CreatePostComponent implements OnInit, OnDestroy {
  isCreated: boolean;
  message: string;
  error: string;
  response;
  responseSubscription: Subscription;

  constructor(private postService: PostService,
              private router: Router) {}

  ngOnInit() {
    this.responseSubscription = this.postService.responseChanged
      .subscribe((response: {
        responseCode: string;
        data: {
          postCreated: boolean,
          message: string
        }
      }) => {
        console.log(response.data);
        if (response.data) {
         this.response = response;
         this.isCreated = this.response.data.postCreated;
        }
      });
  }

  onCreatePost(eventName: NgModel,
               postDescription: HTMLTextAreaElement,
               eventLocation: NgModel,
               createPostForm: NgForm) {
    const post = {
      description: postDescription.value,
      postImage: null,
      eventName: eventName.value,
      eventLocation: eventLocation.value,
      user: new User(1, 'admin', 'admin', 'admin', new Date(), new Role(1, 'admin')),
      hashtag: new Hashtag(1, 'test')
    };
    this.postService
      .createPost(post)
      .subscribe( () => {
        if (this.isCreated) {
          console.log('Created');
          this.message = this.response.data.message;
          createPostForm.reset();
          this.router.navigate(['/posts']);
        } else {
          this.error = this.response.data.message;
          console.log('Error! ' + this.error);
          return false;
        }
      });
  }

  ngOnDestroy(): void {
    this.responseSubscription.unsubscribe();
  }
}
