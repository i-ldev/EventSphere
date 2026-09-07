// src/infrastructure/repositories/MongoEventRepository.ts
import { IEventRepository, EventQuery, PopulatedEvent } from '../../domain/repositories/IEventRepository.js';
import { Event } from '../../domain/entities/Event.js';
import { EventModel, IEventDocument } from '../database/models/EventModel.js';

export class MongoEventRepository implements IEventRepository {
  private toDomainEntity(doc: IEventDocument): Event {
    return new Event(
      String(doc._id),
      doc.title,
      doc.description,
      doc.date,
      doc.venue ? String(doc.venue) : '',
      String(doc.organizerId),
      doc.status,
      doc.category,
      doc.imageUrl,
      doc.maxCapacity,
      doc.workspaceId ? String(doc.workspaceId) : undefined,
      doc.isVirtual,
      doc.meetingUrl,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async findAll(query?: EventQuery): Promise<PopulatedEvent[]> {
    const mongooseQuery: any = {};
    if (query?.status) mongooseQuery.status = query.status;
    if (query?.category) mongooseQuery.category = query.category;
    if (query?.search) mongooseQuery.title = { $regex: query.search, $options: 'i' };
    if (query?.workspaceId) mongooseQuery.workspaceId = query.workspaceId;

    const docs = await EventModel.find(mongooseQuery).populate('venue', 'name address capacity');
    
    return docs.map(doc => {
      const venueData = doc.venue as unknown as { _id: import('mongoose').Types.ObjectId; name: string; address: string; capacity: number } | null;
      
      return {
        id: String(doc._id),
        title: doc.title,
        description: doc.description,
        date: doc.date,
        status: doc.status,
        organizerId: String(doc.organizerId),
        venue: venueData && 'name' in venueData ? {
          id: String(venueData._id),
          name: venueData.name,
          address: venueData.address,
          capacity: venueData.capacity
        } : null,
        category: doc.category,
        imageUrl: doc.imageUrl,
        maxCapacity: doc.maxCapacity,
        workspaceId: doc.workspaceId ? String(doc.workspaceId) : undefined,
        isVirtual: doc.isVirtual, // Ensure this is here
        meetingUrl: doc.meetingUrl, // Ensure this is here
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      };
    });
  }

  async findById(id: string): Promise<Event | null> {
    const doc = await EventModel.findById(id);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    const docs = await EventModel.find({ organizerId });
    return docs.map(doc => this.toDomainEntity(doc));
  }

  async create(event: Event): Promise<Event> {
    // Bulletproof payload: only include venue if it actually has a value
    const payload: any = {
      title: event.title,
      description: event.description,
      date: event.date,
      organizerId: event.organizerId,
      status: event.status,
      category: event.category,
      imageUrl: event.imageUrl,
      maxCapacity: event.maxCapacity,
      workspaceId: event.workspaceId,
      isVirtual: event.isVirtual,
      meetingUrl: event.meetingUrl,
    };

    if (event.venue && event.venue !== 'null' && event.venue !== '') {
      payload.venue = event.venue;
    }

    const doc = await EventModel.create(payload);
    return this.toDomainEntity(doc);
  }

  async update(event: Event): Promise<Event | null> {
    const payload: any = {
      title: event.title,
      description: event.description,
      date: event.date,
      organizerId: event.organizerId,
      status: event.status,
      category: event.category,
      imageUrl: event.imageUrl,
      maxCapacity: event.maxCapacity,
      workspaceId: event.workspaceId,
      isVirtual: event.isVirtual,
      meetingUrl: event.meetingUrl,
    };

    if (event.venue && event.venue !== 'null' && event.venue !== '') {
      payload.venue = event.venue;
    } else {
      payload.venue = null; // Explicitly set to null if removing venue
    }

    const doc = await EventModel.findByIdAndUpdate(
      event.id,
      payload,
      { new: true }
    );
    return doc ? this.toDomainEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await EventModel.findByIdAndDelete(id);
    return !!result;
  }
}