export class Role {
  userId: number;
  role: string;

  constructor(id: number, role: string) {
    this.userId = id;
    this.role = role;
  }
}
