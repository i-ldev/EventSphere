// src/infrastructure/auth/JwtService.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface JwtPayload {
  id: string;
  role: string;
}

export class JwtService {
  generateAccessToken(payload: JwtPayload): string {
    const options = { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions;
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  generateRefreshToken(payload: JwtPayload): string {
    const options = { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions;
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  }
}
