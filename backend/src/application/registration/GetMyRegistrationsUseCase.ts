// src/application/registration/GetMyRegistrationsUseCase.ts
import { PopulatedRegistration } from '../../domain/repositories/IRegistrationRepository.js';

export class GetMyRegistrationsUseCase {
  constructor(
    private registrationRepository: {
      findByUserId: (userId: string) => Promise<PopulatedRegistration[]>;
    },
  ) {}

  async execute(userId: string): Promise<PopulatedRegistration[]> {
    return await this.registrationRepository.findByUserId(userId);
  }
}
