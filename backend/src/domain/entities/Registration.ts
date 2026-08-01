// src/domain/entities/Registration.ts
import { RegistrationStatus } from '../../shared/enums/registrationStatus.enum.js';

export class Registration {
  constructor(
    public id: string,
    public eventId: string,
    public ticketTypeId: string,
    public userId: string,
    public status: RegistrationStatus = RegistrationStatus.CONFIRMED,
    public checkedIn: boolean = false,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
