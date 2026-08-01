// src/application/registration/CheckInAttendeeUseCase.ts
import { IRegistrationRepository } from '../../domain/repositories/IRegistrationRepository.js';
import { IEventRepository } from '../../domain/repositories/IEventRepository.js';
import { RegistrationStatus } from '../../shared/enums/registrationStatus.enum.js';

export class CheckInAttendeeUseCase {
  constructor(
    private registrationRepository: IRegistrationRepository,
    private eventRepository: IEventRepository,
  ) {}

  async execute(registrationId: string, organizerId: string): Promise<void> {
    // 1. Find the registration
    const registration =
      await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new Error('Ticket not found');
    }

    // 2. Security check: Verify the scanner is the organizer of this event
    const event = await this.eventRepository.findById(registration.eventId);
    if (!event) {
      throw new Error('Associated event not found');
    }
    if (event.organizerId !== organizerId) {
      throw new Error(
        'Unauthorized: You can only check in attendees for your own events',
      );
    }

    // 3. Verify ticket is active
    if (registration.status !== RegistrationStatus.CONFIRMED) {
      throw new Error(`Ticket is ${registration.status}, cannot check in`);
    }

    // 4. Check if already checked in
    if (registration.checkedIn) {
      throw new Error('Attendee has already been checked in');
    }

    // 5. Mark as checked in
    registration.checkedIn = true;
    await this.registrationRepository.update(registration);
  }
}
