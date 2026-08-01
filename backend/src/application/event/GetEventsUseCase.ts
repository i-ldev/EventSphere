// src/application/event/GetEventsUseCase.ts
import { Event } from '../../domain/entities/Event.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';

export class GetEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(): Promise<Event[]> {
    // In the future, we can add filtering/pagination here
    return await this.eventRepository.findAll();
  }
}
