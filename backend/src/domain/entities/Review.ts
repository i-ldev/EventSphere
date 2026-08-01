// src/domain/entities/Review.ts
export class Review {
  constructor(
    public id: string,
    public eventId: string,
    public userId: string,
    public rating: number, // 1 to 5
    public comment: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
