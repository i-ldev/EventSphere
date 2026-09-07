// src/application/event/GetEventStatsUseCase.ts
import { IRegistrationRepository, EventStats } from '../../domain/repositories/IRegistrationRepository.js';

export class GetEventStatsUseCase {
  constructor(private registrationRepository: IRegistrationRepository) {}

  async execute(eventId: string): Promise<EventStats> {
    return await this.registrationRepository.getEventStats(eventId);
  }
}