import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import {
  getAllPublishedPosts,
  getPostBySlug,
  getUserDrafts,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
} from '../controllers/postController';

const router = Router();

/**
 * GET /api/posts
 * Get all published posts (public feed)
 */
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).toInt().withMessage('Offset must be non-negative'),
    validate,
  ],
  getAllPublishedPosts
);

/**
 * GET /api/posts/my/drafts
 * Get current user's drafts (requires authentication)
 */
router.get('/my/drafts', authenticate, getUserDrafts);

/**
 * GET /api/posts/:slug
 * Get single post by slug
 * Public if published, requires auth if draft
 */
router.get(
  '/:slug',
  [
    param('slug').notEmpty().withMessage('Slug is required'),
    validate,
  ],
  optionalAuthenticate,
  getPostBySlug
);

/**
 * POST /api/posts
 * Create a new post (draft by default)
 */
router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title must be 1-255 characters'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    body('slug').optional().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
    body('coverImageUrl').optional().isURL().withMessage('Cover image must be a valid URL'),
    validate,
  ],
  createPost
);

/**
 * PUT /api/posts/:id
 * Update a post
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be 1-255 characters'),
    body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
    body('slug').optional().trim().matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
    body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
    body('coverImageUrl').optional().isURL().withMessage('Cover image must be a valid URL'),
    validate,
  ],
  updatePost
);

/**
 * POST /api/posts/:id/publish
 * Publish a draft
 */
router.post(
  '/:id/publish',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    validate,
  ],
  publishPost
);

/**
 * POST /api/posts/:id/unpublish
 * Unpublish a post (convert back to draft)
 */
router.post(
  '/:id/unpublish',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    validate,
  ],
  unpublishPost
);

/**
 * DELETE /api/posts/:id
 * Delete a post
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    validate,
  ],
  deletePost
);

export default router;
