import pool from '../db';
import { Post, PostWithAuthor } from '../types';

export class PostModel {
  /**
   * Create a new post (draft by default)
   */
  static async create(
    authorId: string,
    title: string,
    slug: string,
    content: string,
    excerpt?: string,
    coverImageUrl?: string
  ): Promise<Post> {
    const result = await pool.query(
      `INSERT INTO posts (author_id, title, slug, content, excerpt, cover_image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [authorId, title, slug, content, excerpt, coverImageUrl]
    );
    return result.rows[0];
  }

  /**
   * Find post by ID with author info
   */
  static async findById(postId: string): Promise<PostWithAuthor | null> {
    const result = await pool.query(
      `SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'bio', u.bio,
          'avatar_url', u.avatar_url,
          'created_at', u.created_at
        ) as author
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [postId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find post by slug with author info
   */
  static async findBySlug(slug: string): Promise<PostWithAuthor | null> {
    const result = await pool.query(
      `SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'bio', u.bio,
          'avatar_url', u.avatar_url,
          'created_at', u.created_at
        ) as author
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all published posts (public feed)
   */
  static async findAllPublished(limit = 20, offset = 0): Promise<PostWithAuthor[]> {
    const result = await pool.query(
      `SELECT 
        p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'bio', u.bio,
          'avatar_url', u.avatar_url,
          'created_at', u.created_at
        ) as author
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.is_published = true
       ORDER BY p.published_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Get user's drafts
   */
  static async findDraftsByUser(userId: string): Promise<Post[]> {
    const result = await pool.query(
      `SELECT * FROM posts 
       WHERE author_id = $1 AND is_published = false
       ORDER BY updated_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get user's published posts
   */
  static async findPublishedByUser(userId: string): Promise<Post[]> {
    const result = await pool.query(
      `SELECT * FROM posts 
       WHERE author_id = $1 AND is_published = true
       ORDER BY published_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Update a post
   */
  static async update(
    postId: string,
    updates: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      cover_image_url?: string;
    }
  ): Promise<Post> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(updates.title);
      paramCount++;
    }

    if (updates.slug !== undefined) {
      fields.push(`slug = $${paramCount}`);
      values.push(updates.slug);
      paramCount++;
    }

    if (updates.content !== undefined) {
      fields.push(`content = $${paramCount}`);
      values.push(updates.content);
      paramCount++;
    }

    if (updates.excerpt !== undefined) {
      fields.push(`excerpt = $${paramCount}`);
      values.push(updates.excerpt);
      paramCount++;
    }

    if (updates.cover_image_url !== undefined) {
      fields.push(`cover_image_url = $${paramCount}`);
      values.push(updates.cover_image_url);
      paramCount++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(postId);

    const result = await pool.query(
      `UPDATE posts SET ${fields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Publish a draft
   */
  static async publish(postId: string): Promise<Post> {
    const result = await pool.query(
      `UPDATE posts 
       SET is_published = true, 
           published_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [postId]
    );
    return result.rows[0];
  }

  /**
   * Unpublish a post (convert back to draft)
   */
  static async unpublish(postId: string): Promise<Post> {
    const result = await pool.query(
      `UPDATE posts 
       SET is_published = false, 
           published_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [postId]
    );
    return result.rows[0];
  }

  /**
   * Delete a post
   */
  static async delete(postId: string): Promise<void> {
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
  }

  /**
   * Check if slug exists (for uniqueness validation)
   */
  static async slugExists(slug: string, excludePostId?: string): Promise<boolean> {
    let query = 'SELECT 1 FROM posts WHERE slug = $1';
    const params: any[] = [slug];

    if (excludePostId) {
      query += ' AND id != $2';
      params.push(excludePostId);
    }

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}
