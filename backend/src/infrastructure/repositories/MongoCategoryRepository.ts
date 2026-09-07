// src/infrastructure/repositories/MongoCategoryRepository.ts
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository.js';
import { Category } from '../../domain/entities/Category.js';
import { CategoryModel, ICategoryDocument } from '../database/models/CategoryModel.js';

export class MongoCategoryRepository implements ICategoryRepository {
  private toDomainEntity(doc: ICategoryDocument): Category {
    return new Category(
      String(doc._id), 
      doc.name, 
      doc.createdAt, 
      doc.updatedAt
    );
  }

  async findAll(): Promise<Category[]> {
    const docs = await CategoryModel.find().sort({ name: 1 });
    return docs.map(doc => this.toDomainEntity(doc));
  }

  async create(name: string): Promise<Category> {
    const doc = await CategoryModel.create({ name });
    return this.toDomainEntity(doc);
  }
}