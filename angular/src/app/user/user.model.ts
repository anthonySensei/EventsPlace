import {Role} from './role.model';

export class User {
  id: number;
  name: string;
  email: string;
  profileImage: string;
  password: string;
  createdAt: Date;
  role: Role;
  status?: string;

  constructor(id: number, name: string, email: string, image: string,
              password: string, created: Date, role: Role, status?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.profileImage = image;
    this.password = password;
    this.createdAt = created;
    this.role = role;
    this.status = status;
  }


}
