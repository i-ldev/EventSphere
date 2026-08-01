// src/infrastructure/repositories/MongoEventRepository.ts
import {
  IEventRepository,
  PopulatedEvent,
} from '../../domain/repositories/IEventRepository.js';
import { Event } from '../../domain/entities/Event.js';
import { EventModel, IEventDocument } from '../database/models/EventModel.js';

export class MongoEventRepository implements IEventRepository {
  private toDomainEntity(doc: IEventDocument): Event {
    return new Event(
      String(doc._id),
      doc.title,
      doc.description,
      doc.date,
      String(doc.venue),
      String(doc.organizerId),
      doc.status,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findById(id: string): Promise<Event | null> {
    const doc = await EventModel.findById(id);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findAll(): Promise<PopulatedEvent[]> {
    const docs = await EventModel.find().populate(
      'venue',
      'name address capacity',
    );

    return docs.map((doc) => {
      // Cast to a strict type instead of 'any' to satisfy ESLint
      const venueData = doc.venue as unknown as {
        _id: import('mongoose').Types.ObjectId;
        name: string;
        address: string;
        capacity: number;
      } | null;

      return {
        id: String(doc._id),
        title: doc.title,
        description: doc.description,
        date: doc.date,
        status: doc.status,
        organizerId: String(doc.organizerId),
        venue:
          venueData && 'name' in venueData
            ? {
                id: String(venueData._id),
                name: venueData.name,
                address: venueData.address,
                capacity: venueData.capacity,
              }
            : null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    const docs = await EventModel.find({ organizerId });
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async create(event: Event): Promise<Event> {
    const doc = await EventModel.create({
      title: event.title,
      description: event.description,
      date: event.date,
      venue: event.venue,
      organizerId: event.organizerId,
      status: event.status,
    });
    return this.toDomainEntity(doc);
  }

  async update(event: Event): Promise<Event | null> {
    const doc = await EventModel.findByIdAndUpdate(
      event.id,
      {
        title: event.title,
        description: event.description,
        date: event.date,
        venue: event.venue,
        status: event.status,
      },
      { new: true },
    );
    return doc ? this.toDomainEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await EventModel.findByIdAndDelete(id);
    return !!result;
  }
}
