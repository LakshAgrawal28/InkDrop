import pool from '../db';
import { RefreshToken } from '../types';

export class RefreshTokenModel {
  /**
   * Create a new refresh token
   */
  static async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const result = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  /**
   * Find refresh token by token string
   */
  static async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [token]
    );
    return result.rows[0] || null;
  }

  /**
   * Delete a refresh token (logout)
   */
  static async deleteByToken(token: string): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  /**
   * Delete all refresh tokens for a user (logout all devices)
   */
  static async deleteAllByUser(userId: string): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }

  /**
   * Clean up expired tokens
   */
  static async deleteExpired(): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP');
  }
}
