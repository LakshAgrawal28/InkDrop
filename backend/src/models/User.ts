import pool from '../db';
import { User, UserPublic } from '../types';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(email: string, username: string, passwordHash: string): Promise<UserPublic> {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, username, bio, avatar_url, created_at`,
      [email, username, passwordHash]
    );
    return result.rows[0];
  }

  /**
   * Find user by email (includes password hash)
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID (public info only)
   */
  static async findById(id: string): Promise<UserPublic | null> {
    const result = await pool.query(
      `SELECT id, email, username, bio, avatar_url, created_at 
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by username (public info only)
   */
  static async findByUsername(username: string): Promise<UserPublic | null> {
    const result = await pool.query(
      `SELECT id, email, username, bio, avatar_url, created_at 
       FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0;
  }

  /**
   * Check if username exists
   */
  static async usernameExists(username: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    );
    return result.rows.length > 0;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: { bio?: string; avatar_url?: string }
  ): Promise<UserPublic> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramCount}`);
      values.push(updates.bio);
      paramCount++;
    }

    if (updates.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramCount}`);
      values.push(updates.avatar_url);
      paramCount++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, email, username, bio, avatar_url, created_at`,
      values
    );
    return result.rows[0];
  }
}
