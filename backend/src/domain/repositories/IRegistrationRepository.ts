// src/domain/repositories/IRegistrationRepository.ts
import { Registration } from '../entities/Registration.js';

export interface OrganizerStats {
  totalTicketsSold: number;
  totalRevenue: number;
  totalEvents: number;
}

export interface PopulatedRegistration {
  id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    location: string;
    isVirtual?: boolean;
    meetingUrl?: string | null;
  };
  ticketTypeId: string;
  userId: string;
  status: string;
  checkedIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegistrationRepository {
  findById(id: string): Promise<Registration | null>;
  findByUserId(userId: string): Promise<PopulatedRegistration[]>;
  findByEventId(eventId: string): Promise<Registration[]>;
  create(registration: Registration): Promise<Registration>;
  update(registration: Registration): Promise<Registration | null>;
  getOrganizerStats(organizerId: string): Promise<OrganizerStats>;
}