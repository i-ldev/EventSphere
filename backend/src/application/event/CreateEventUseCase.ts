// src/application/event/CreateEventUseCase.ts
import { Event } from '../../domain/entities/Event.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';
import { EventStatus } from '../../shared/enums/eventStatus.enum.js';

export interface CreateEventDTO {
  title: string;
  description: string;
  date: string;
  venue: string; // Changed from location to venue
}

export class CreateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(dto: CreateEventDTO, organizerId: string): Promise<Event> {
    const newEvent = new Event(
      '',
      dto.title,
      dto.description,
      new Date(dto.date),
      dto.venue, // Use venue ID
      organizerId,
      EventStatus.DRAFT,
    );

    return await this.eventRepository.create(newEvent);
  }
}
