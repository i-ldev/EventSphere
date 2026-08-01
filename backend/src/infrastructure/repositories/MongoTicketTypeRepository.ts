// src/infrastructure/repositories/MongoTicketTypeRepository.ts
import { ITicketTypeRepository } from '../../domain/repositories/ITicketTypeRepository.js';
import { TicketType } from '../../domain/entities/TicketType.js';
import {
  TicketTypeModel,
  ITicketTypeDocument,
} from '../database/models/TicketTypeModel.js';

export class MongoTicketTypeRepository implements ITicketTypeRepository {
  private toDomainEntity(doc: ITicketTypeDocument): TicketType {
    return new TicketType(
      String(doc._id),
      String(doc.eventId),
      doc.name,
      doc.price,
      doc.quantity,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findById(id: string): Promise<TicketType | null> {
    const doc = await TicketTypeModel.findById(id);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByEventId(eventId: string): Promise<TicketType[]> {
    const docs = await TicketTypeModel.find({ eventId });
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async create(ticket: TicketType): Promise<TicketType> {
    const doc = await TicketTypeModel.create({
      eventId: ticket.eventId,
      name: ticket.name,
      price: ticket.price,
      quantity: ticket.quantity,
    });
    return this.toDomainEntity(doc);
  }

  async update(ticket: TicketType): Promise<TicketType | null> {
    const doc = await TicketTypeModel.findByIdAndUpdate(
      ticket.id,
      {
        name: ticket.name,
        price: ticket.price,
        quantity: ticket.quantity,
      },
      { new: true },
    );
    return doc ? this.toDomainEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TicketTypeModel.findByIdAndDelete(id);
    return !!result;
  }
}
