// src/application/user/RegisterUserUseCase.ts
import bcrypt from 'bcrypt';
import { User } from '../../domain/entities/User.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { Role } from '../../shared/enums/role.enum.js';

// Input DTO (Data Transfer Object) - defines what data we need to register
export interface RegisterUserDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: Role; // Optional, defaults to ATTENDEE
}

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<User> {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create the Domain Entity
    const newUser = new User(
      '', // ID is empty, MongoDB will generate it
      dto.email,
      hashedPassword,
      dto.role || Role.ATTENDEE,
      dto.firstName,
      dto.lastName,
      false, // isEmailVerified defaults to false
    );

    // 4. Save to database via repository
    return await this.userRepository.create(newUser);
  }
}
