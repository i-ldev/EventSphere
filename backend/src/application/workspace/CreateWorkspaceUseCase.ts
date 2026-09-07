// src/application/workspace/CreateWorkspaceUseCase.ts
import { Workspace } from '../../domain/entities/Workspace.js';
import { MongoWorkspaceRepository } from '../../infrastructure/repositories/MongoWorkspaceRepository.js';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository.js';

export class CreateWorkspaceUseCase {
  constructor(
    private workspaceRepository: MongoWorkspaceRepository,
    private userRepository: MongoUserRepository
  ) {}

  async execute(name: string, ownerId: string): Promise<Workspace> {
    // Check if user already has a workspace
    const existing = await this.workspaceRepository.findByOwnerId(ownerId);
    if (existing) {
      throw new Error('User already has a workspace.');
    }

    const workspace = await this.workspaceRepository.create(name, ownerId);

    // Link workspace to user
    const user = await this.userRepository.findById(ownerId);
    if (user) {
      user.workspaceId = workspace.id;
      await this.userRepository.update(user);
    }

    return workspace;
  }
}