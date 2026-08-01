// src/domain/entities/TicketType.ts
export class TicketType {
  constructor(
    public id: string,
    public eventId: string,
    public name: string,
    public price: number,
    public quantity: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
