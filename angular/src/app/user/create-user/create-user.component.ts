import { Component, OnInit } from '@angular/core';
import {NgModel} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {
  isEmailError: boolean;
  error: string;
  userRole: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    console.log(this.userRole);
  }

  onCreateUser(email: NgModel, name: NgModel) {

  }
}
