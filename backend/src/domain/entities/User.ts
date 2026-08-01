// src/domain/entities/User.ts
import { Role } from '../../shared/enums/role.enum.js';

export class User {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public role: Role,
    public firstName?: string,
    public lastName?: string,
    public isEmailVerified: boolean = false,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
