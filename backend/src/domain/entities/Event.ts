// src/domain/entities/Event.ts
import { EventStatus } from '../../shared/enums/eventStatus.enum.js';

export class Event {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public date: Date,
    public venue: string,
    public organizerId: string,
    public status: EventStatus = EventStatus.DRAFT,
    public category?: string,
    public imageUrl?: string,
    public maxCapacity: number = 50, 
    public workspaceId?: string, 
    public isVirtual: boolean = false, 
    public meetingUrl?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}