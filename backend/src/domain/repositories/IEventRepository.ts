// src/domain/repositories/IEventRepository.ts
import { Event } from '../entities/Event.js';

export interface PopulatedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
  organizerId: string;
  venue: { id: string; name: string; address: string; capacity: number } | null;
  category?: string;
  imageUrl?: string;
  maxCapacity: number;
  workspaceId?: string;
  isVirtual?: boolean; // <-- Add this
  meetingUrl?: string | null; // <-- Add this
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventQuery {
  status?: string;
  category?: string;
  search?: string;
  workspaceId?: string;
}

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findAll(query?: EventQuery): Promise<PopulatedEvent[]>;
  findByOrganizer(organizerId: string): Promise<Event[]>;
  create(event: Event): Promise<Event>;
  update(event: Event): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
}