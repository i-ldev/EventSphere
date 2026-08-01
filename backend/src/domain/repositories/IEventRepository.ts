// src/domain/repositories/IEventRepository.ts
import { Event } from '../entities/Event.js';

export interface PopulatedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
  organizerId: string;
  venue: {
    id: string;
    name: string;
    address: string;
    capacity: number;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findAll(): Promise<PopulatedEvent[]>;
  findByOrganizer(organizerId: string): Promise<Event[]>;
  create(event: Event): Promise<Event>;
  update(event: Event): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
}
