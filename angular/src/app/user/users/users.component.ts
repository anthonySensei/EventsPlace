import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from '../user.model';
import {Subscription} from 'rxjs';
import {UserService} from '../user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']
})
export class UsersComponent implements OnInit, OnDestroy {
  isLoading = false;
  users: User[] = [];

  userSubscription: Subscription;
  usersHttpSubscription: Subscription;

  response;

  nonProfileImage = 'https://www.w3schools.com/w3css/img_avatar3.png';

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.isLoading = true;
    this.usersHttpSubscription = this.userService.getUsersHttp().subscribe();
    this.userSubscription = this.userService.usersChanged
      .subscribe(users => {
        this.users = users;
        this.isLoading = false;
      });
    this.users = this.userService.getUsers();
  }

  ngOnDestroy(): void {
    this.usersHttpSubscription.unsubscribe();
  }

}
