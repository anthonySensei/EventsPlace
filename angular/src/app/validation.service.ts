import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  private emailValidation = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  private passwordValidation = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

  constructor() { }

  getEmailValidation() {
    return this.emailValidation;
  }

  getPasswordValidation() {
    return this.passwordValidation;
  }

  comparePasswords(password, passwordRetype) {
    return password === passwordRetype;
  }
}
