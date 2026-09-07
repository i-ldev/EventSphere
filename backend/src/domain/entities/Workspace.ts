// src/domain/entities/Workspace.ts
export class Workspace {
  constructor(
    public id: string,
    public name: string,
    public ownerId: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}