import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckFormService {

  constructor() {}

  comparePasswords(password, passwordRetype) {
    return password === passwordRetype;
  }

}
