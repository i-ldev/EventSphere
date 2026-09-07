// src/application/event/GetEventsUseCase.ts
import { IEventRepository, EventQuery, PopulatedEvent } from '../../domain/repositories/IEventRepository.js';

export class GetEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(query?: EventQuery): Promise<PopulatedEvent[]> {
    return await this.eventRepository.findAll(query);
  }
}