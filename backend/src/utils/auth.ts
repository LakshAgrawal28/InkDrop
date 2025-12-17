import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token (short-lived)
 */
export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'access' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

/**
 * Generate JWT refresh token (long-lived)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): { userId: string } {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as any;
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId };
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as any;
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Calculate refresh token expiry date
 */
export function getRefreshTokenExpiry(): Date {
  const expiry = config.jwt.refreshExpiry;
  const match = expiry.match(/(\d+)([dhms])/);
  
  if (!match) {
    throw new Error('Invalid refresh token expiry format');
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const now = new Date();
  
  switch (unit) {
    case 'd':
      now.setDate(now.getDate() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 's':
      now.setSeconds(now.getSeconds() + value);
      break;
  }
  
  return now;
}
