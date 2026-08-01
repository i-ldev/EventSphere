// src/application/user/LoginUserUseCase.ts
import bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { JwtService } from '../../infrastructure/auth/JwtService.js';

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async execute(dto: LoginUserDTO): Promise<AuthTokens> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
