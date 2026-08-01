// src/domain/entities/Event.ts
import { EventStatus } from '../../shared/enums/eventStatus.enum.js';

export class Event {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public date: Date,
    public venue: string, // Changed from location to venue (ID)
    public organizerId: string,
    public status: EventStatus = EventStatus.DRAFT,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
