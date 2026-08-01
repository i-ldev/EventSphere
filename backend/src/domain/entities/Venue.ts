// src/domain/entities/Venue.ts
export class Venue {
  constructor(
    public id: string,
    public name: string,
    public address: string,
    public capacity: number,
    public description?: string,
    public equipment: string[] = [],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
