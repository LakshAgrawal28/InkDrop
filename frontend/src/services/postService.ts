import api from '../lib/api';
import { User } from './authService';

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: User;
}

export interface CreatePostData {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string;
}

export const postService = {
  /**
   * Get all published posts
   */
  async getPublishedPosts(limit = 20, offset = 0): Promise<PostWithAuthor[]> {
    const response = await api.get(`/posts?limit=${limit}&offset=${offset}`);
    return response.data.posts;
  },

  /**
   * Get single post by slug
   */
  async getPostBySlug(slug: string): Promise<PostWithAuthor> {
    const response = await api.get(`/posts/${slug}`);
    return response.data.post;
  },

  /**
   * Get current user's drafts
   */
  async getMyDrafts(): Promise<Post[]> {
    const response = await api.get('/posts/my/drafts');
    return response.data.drafts;
  },

  /**
   * Create a new post (draft)
   */
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await api.post('/posts', data);
    return response.data.post;
  },

  /**
   * Update a post
   */
  async updatePost(id: string, data: UpdatePostData): Promise<Post> {
    const response = await api.put(`/posts/${id}`, data);
    return response.data.post;
  },

  /**
   * Publish a draft
   */
  async publishPost(id: string): Promise<Post> {
    const response = await api.post(`/posts/${id}/publish`);
    return response.data.post;
  },

  /**
   * Unpublish a post
   */
  async unpublishPost(id: string): Promise<Post> {
    const response = await api.post(`/posts/${id}/unpublish`);
    return response.data.post;
  },

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },
};
