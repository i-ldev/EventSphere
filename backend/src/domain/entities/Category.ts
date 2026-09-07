// src/domain/entities/Category.ts
export class Category {
  constructor(
    public id: string,
    public name: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}