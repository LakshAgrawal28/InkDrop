export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  bio?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at: Date;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  is_published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PostWithAuthor extends Post {
  author: UserPublic;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}
