// src/application/event/CreateEventUseCase.ts
import { Event } from '../../domain/entities/Event.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';
import { EventStatus } from '../../shared/enums/eventStatus.enum.js';

export interface CreateEventDTO {
  title: string;
  description: string;
  date: string; 
  venue: string;
  category?: string;
  imageUrl?: string;
  maxCapacity: number; 
  workspaceId?: string; 
  isVirtual?: boolean; 
}

export class CreateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(dto: CreateEventDTO, organizerId: string): Promise<Event> {
    const newEvent = new Event(
      '', 
      dto.title,
      dto.description,
      new Date(dto.date),
      dto.venue,
      organizerId,
      EventStatus.DRAFT,
      dto.category,
      dto.imageUrl,
      dto.maxCapacity, // <-- Add this
      dto.workspaceId // <-- Add this
    );

    return await this.eventRepository.create(newEvent);
  }
}