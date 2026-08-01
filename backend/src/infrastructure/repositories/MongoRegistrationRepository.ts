// src/infrastructure/repositories/MongoRegistrationRepository.ts
import {
  IRegistrationRepository,
  OrganizerStats,
  PopulatedRegistration,
} from '../../domain/repositories/IRegistrationRepository.js';
import { Registration } from '../../domain/entities/Registration.js';
import {
  RegistrationModel,
  IRegistrationDocument,
} from '../database/models/RegistrationModel.js';
import { EventModel } from '../database/models/EventModel.js';

export class MongoRegistrationRepository implements IRegistrationRepository {
  private toDomainEntity(doc: IRegistrationDocument): Registration {
    return new Registration(
      String(doc._id),
      String(doc.eventId),
      String(doc.ticketTypeId),
      String(doc.userId),
      doc.status,
      doc.checkedIn,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findById(id: string): Promise<Registration | null> {
    const doc = await RegistrationModel.findById(id);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<PopulatedRegistration[]> {
    const docs = await RegistrationModel.find({ userId }).populate(
      'eventId',
      'title date location',
    );

    // Map to our strictly typed PopulatedRegistration interface
    return docs.map((doc) => ({
      id: String(doc._id),
      eventId: doc.eventId as unknown as PopulatedRegistration['eventId'],
      ticketTypeId: String(doc.ticketTypeId),
      userId: String(doc.userId),
      status: doc.status,
      checkedIn: doc.checkedIn,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    }));
  }

  async findByEventId(eventId: string): Promise<Registration[]> {
    const docs = await RegistrationModel.find({ eventId });
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async create(registration: Registration): Promise<Registration> {
    const doc = await RegistrationModel.create({
      eventId: registration.eventId,
      ticketTypeId: registration.ticketTypeId,
      userId: registration.userId,
      status: registration.status,
      checkedIn: registration.checkedIn,
    });
    return this.toDomainEntity(doc);
  }

  async update(registration: Registration): Promise<Registration | null> {
    const doc = await RegistrationModel.findByIdAndUpdate(
      registration.id,
      {
        $set: {
          status: registration.status,
          checkedIn: registration.checkedIn,
        },
      },
      { new: true },
    );
    return doc ? this.toDomainEntity(doc) : null;
  }

  async getOrganizerStats(organizerId: string): Promise<OrganizerStats> {
    const events = await EventModel.find({ organizerId }).select('_id');
    const eventIds = events.map((e) => e._id);

    if (eventIds.length === 0) {
      return { totalTicketsSold: 0, totalRevenue: 0, totalEvents: 0 };
    }

    const stats = await RegistrationModel.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $lookup: {
          from: 'tickettypes',
          localField: 'ticketTypeId',
          foreignField: '_id',
          as: 'ticketType',
        },
      },
      { $unwind: '$ticketType' },
      {
        $group: {
          _id: null,
          totalTicketsSold: { $sum: 1 },
          totalRevenue: { $sum: '$ticketType.price' },
        },
      },
    ]);

    return {
      totalTicketsSold: stats[0]?.totalTicketsSold || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalEvents: eventIds.length,
    };
  }
}
