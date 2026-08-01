// src/infrastructure/repositories/MongoUserRepository.ts
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { UserModel, IUserDocument } from '../database/models/UserModel.js';

export class MongoUserRepository implements IUserRepository {
  // Helper function to convert Mongo doc to Domain Entity
  private toDomainEntity(doc: IUserDocument): User {
    return new User(
      String(doc._id),
      doc.email,
      doc.password,
      doc.role,
      doc.firstName,
      doc.lastName,
      doc.isEmailVerified,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await UserModel.find();
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      email: user.email,
      password: user.password,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
    });
    return this.toDomainEntity(doc);
  }

  async update(user: User): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(
      user.id,
      {
        email: user.email,
        password: user.password,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
      { new: true },
    );
    return doc ? this.toDomainEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
