import {Role} from './role.model';

export class User {
  userId: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  role: Role;

  constructor(id: number, name: string, email: string,
              password: string, created: Date, role: Role) {
    this.userId = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = created;
    this.role = role;
  }


}
