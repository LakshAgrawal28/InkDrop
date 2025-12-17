# InkDrop 🖋️

A **draft-first, expressive blogging platform** built with modern web technologies. InkDrop is designed for writers who want a calm, distraction-free space to compose and share their thoughts.

## 🎯 Philosophy

InkDrop is NOT a Medium clone. It's built on these principles:

- **Draft-first workflow** - Write without pressure, publish when ready
- **Markdown-powered** - Simple, portable, version-control friendly
- **No vanity metrics** - No likes, claps, or follower counts
- **Clean reading experience** - Typography-focused, minimal UI
- **Personal & expressive** - Your space, your voice

## 🏗️ Architecture

```
InkDrop/
├── backend/          # Node.js + Express + TypeScript + PostgreSQL
└── frontend/         # React + TypeScript + Tailwind CSS
```

### Backend Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: express-validator

### Frontend Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Markdown**: react-markdown
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Setup Database

```bash
# Create PostgreSQL database
createdb inkdrop

# Or using psql
psql -U postgres
CREATE DATABASE inkdrop;
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secrets

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Update VITE_API_URL if needed

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}
```

#### Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### Post Endpoints

#### Get All Published Posts
```http
GET /api/posts?limit=20&offset=0
```

#### Get Post by Slug
```http
GET /api/posts/:slug
```

#### Get My Drafts
```http
GET /api/posts/my/drafts
Authorization: Bearer {accessToken}
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "My First Post",
  "content": "# Hello World\n\nThis is my first post!",
  "slug": "my-first-post",
  "excerpt": "A brief introduction...",
  "coverImageUrl": "https://example.com/image.jpg"
}
```

#### Update Post
```http
PUT /api/posts/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Publish Post
```http
POST /api/posts/:id/publish
Authorization: Bearer {accessToken}
```

#### Unpublish Post
```http
POST /api/posts/:id/unpublish
Authorization: Bearer {accessToken}
```

#### Delete Post
```http
DELETE /api/posts/:id
Authorization: Bearer {accessToken}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Separate access and refresh tokens
- **Token Rotation**: Refresh tokens stored in database
- **Input Validation**: express-validator on all endpoints
- **SQL Injection Protection**: Parameterized queries with pg
- **CORS Configuration**: Restricted to frontend origin

## 🎨 Key Features

### For Writers
- ✍️ **Markdown Editor** - Write in plain Markdown with live preview
- 💾 **Autosave** - Never lose your work (saves every 3 seconds)
- 📝 **Draft Management** - Keep drafts private until ready to publish
- 🔄 **Edit Anytime** - Update published posts without friction
- 🚀 **One-Click Publish** - Go live when you're ready

### For Readers
- 📖 **Clean Typography** - Serif fonts, generous spacing
- 🎯 **Focus on Content** - No distractions, no ads
- 📱 **Responsive Design** - Great experience on all devices
- 🔍 **Simple Discovery** - Chronological feed, no algorithm

## 🚢 Deployment

### Backend (Railway/Render)

1. Push code to GitHub
2. Create new project on Railway/Render
3. Connect your repository
4. Set environment variables:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `FRONTEND_URL`
5. Deploy!

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variable:
   - `VITE_API_URL` (your backend URL)
4. Deploy!

## 🛠️ Development Guidelines

### Code Style
- Use TypeScript for type safety
- Write small, composable functions
- Prefer readability over cleverness
- Add comments only where reasoning is non-obvious
- Follow REST conventions for APIs

### Folder Structure
- Keep related code together
- Separate concerns (models, controllers, services)
- Use index files for clean imports
- Avoid deep nesting (max 3-4 levels)

### Error Handling
- Always use try-catch for async operations
- Return consistent error responses
- Log errors for debugging
- Never expose sensitive info in errors

## 🤝 Contributing

This is a learning project, but suggestions are welcome! Focus areas:

- Image upload to Cloudinary/S3
- Rich text editor improvements
- Search functionality
- User profiles
- Social features (following, bookmarks)
- Performance optimizations

## 📝 License

MIT License - feel free to use this project for learning or as a base for your own blogging platform.

## 🎓 Learning Resources

This project demonstrates:
- RESTful API design
- JWT authentication flow
- React hooks and context
- TypeScript best practices
- PostgreSQL schema design
- Tailwind CSS styling
- Deployment workflow

## 🐛 Known Limitations

- No image upload (use external URLs for now)
- No search functionality
- No pagination on frontend
- No email verification
- No password reset flow
- No rich text editor (markdown only)

These are intentional omissions to keep the project focused and beginner-friendly. They make great extension exercises!

---

Built with ❤️ for writers who value simplicity and expression over metrics and engagement.
