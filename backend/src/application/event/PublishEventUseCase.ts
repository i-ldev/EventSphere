// src/application/event/PublishEventUseCase.ts
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';
import { EventStatus } from '../../shared/enums/eventStatus.enum.js';

export class PublishEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string, organizerId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Security check: Only the owner can publish the event
    if (event.organizerId !== organizerId) {
      throw new Error('Unauthorized: You are not the organizer of this event');
    }

    event.status = EventStatus.PUBLISHED;
    await this.eventRepository.update(event);
  }
}
