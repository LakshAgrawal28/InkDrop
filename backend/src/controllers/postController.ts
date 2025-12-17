import { Request, Response, NextFunction } from 'express';
import { PostModel } from '../models/Post';
import { generateSlug, generateExcerpt } from '../utils/helpers';

/**
 * Get all published posts (public feed)
 * GET /api/posts
 */
export async function getAllPublishedPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const posts = await PostModel.findAllPublished(limit, offset);
    
    res.json({
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single post by slug
 * GET /api/posts/:slug
 */
export async function getPostBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const userId = req.userId; // May be undefined if not authenticated
    
    const post = await PostModel.findBySlug(slug);
    
    if (!post) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found',
      });
    }
    
    // If post is a draft, only author can view it
    if (!post.is_published && post.author_id !== userId) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found',
      });
    }
    
    res.json({ post });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user's drafts
 * GET /api/posts/my/drafts
 */
export async function getUserDrafts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!; // Set by authenticate middleware
    
    const drafts = await PostModel.findDraftsByUser(userId);
    
    res.json({ drafts });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new post (draft by default)
 * POST /api/posts
 */
export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!; // Set by authenticate middleware
    const { title, content, slug: customSlug, excerpt, coverImageUrl } = req.body;
    
    // Generate slug from title if not provided
    let slug = customSlug || generateSlug(title);
    
    // Ensure slug is unique
    if (await PostModel.slugExists(slug)) {
      // Add random suffix to make it unique
      slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
    }
    
    // Generate excerpt from content if not provided
    const finalExcerpt = excerpt || generateExcerpt(content);
    
    const post = await PostModel.create(
      userId,
      title,
      slug,
      content,
      finalExcerpt,
      coverImageUrl
    );
    
    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a post
 * PUT /api/posts/:id
 */
export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!; // Set by authenticate middleware
    const { id } = req.params;
    const { title, content, slug, excerpt, coverImageUrl } = req.body;
    
    // Check if post exists
    const existingPost = await PostModel.findById(id);
    
    if (!existingPost) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found',
      });
    }
    
    // Check if user is the author
    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own posts',
      });
    }
    
    // If slug is being changed, ensure it's unique
    if (slug && slug !== existingPost.slug) {
      if (await PostModel.slugExists(slug, id)) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Slug already in use',
        });
      }
    }
    
    // Build updates object
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (slug !== undefined) updates.slug = slug;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (coverImageUrl !== undefined) updates.cover_image_url = coverImageUrl;
    
    const post = await PostModel.update(id, updates);
    
    res.json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Publish a draft
 * POST /api/posts/:id/publish
 */
export async function publishPost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!; // Set by authenticate middleware
    const { id } = req.params;
    
    // Check if post exists
    const existingPost = await PostModel.findById(id);
    
    if (!existingPost) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found',
      });
    }
    
    // Check if user is the author
    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only publish your own posts',
      });
    }
    
    // Check if already published
    if (existingPost.is_published) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Post is already published',
      });
    }
    
    const post = await PostModel.publish(id);
    
    res.json({
      message: 'Post published successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unpublish a post (convert back to draft)
 * POST /api/posts/:id/unpublish
 */
export async function unpublishPost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!; // Set by authenticate middleware
    const { id } = req.params;
    
    // Check if post exists
    const existingPost = await PostModel.findById(id);
    
    if (!existingPost) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found',
      });
    }
    
    // Check if user is the author
    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only unpublish your own posts',
      });
    }
    
    // Check if already a draft
    if (!existingPost.is_published) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Post is already a draft',
      });
    }
    
    const post = await PostModel.unpublish(id);
    
    res.json({
      message: 'Post unpublished successfully',
      post,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a post
 * DELETE /api/posts/:id
 */
export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!; // Set by authenticate middleware
    const { id } = req.params;
    
    // Check if post exists
    const existingPost = await PostModel.findById(id);
    
    if (!existingPost) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found',
      });
    }
    
    // Check if user is the author
    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own posts',
      });
    }
    
    await PostModel.delete(id);
    
    res.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
