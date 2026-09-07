// src/application/event/UpdateEventUseCase.ts
import { randomBytes } from 'crypto'; // <-- Import crypto for security
import { Event } from '../../domain/entities/Event.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export interface UpdateEventDTO {
  title: string;
  description: string;
  date: string;
  venue: string | null;
  category?: string;
  imageUrl?: string;
  maxCapacity: number;
  isVirtual?: boolean;
}

export class UpdateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(id: string, dto: UpdateEventDTO): Promise<Event | null> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    event.title = dto.title;
    event.description = dto.description;
    event.date = new Date(dto.date);
    event.venue = dto.venue || '';
    event.category = dto.category;
    event.imageUrl = dto.imageUrl;
    event.maxCapacity = dto.maxCapacity;
    event.isVirtual = dto.isVirtual || false;

    // FIX: If the event is toggled to Virtual, but doesn't have a meetingUrl yet, generate one!
    if (event.isVirtual && !event.meetingUrl) {
      const randomId = randomBytes(8).toString('hex');
      event.meetingUrl = `https://meet.jit.si/EventSphere-${randomId}`;
    }

    return await this.eventRepository.update(event);
  }
}