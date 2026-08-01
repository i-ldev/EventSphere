// src/application/registration/GetOrganizerStatsUseCase.ts
import {
  IRegistrationRepository,
  OrganizerStats,
} from '../../domain/repositories/IRegistrationRepository.js';

export class GetOrganizerStatsUseCase {
  constructor(private registrationRepository: IRegistrationRepository) {}

  async execute(organizerId: string): Promise<OrganizerStats> {
    return await this.registrationRepository.getOrganizerStats(organizerId);
  }
}
