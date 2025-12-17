# InkDrop Backend

Draft-first blogging platform backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

3. Create PostgreSQL database:
```bash
createdb inkdrop
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all published posts (public)
- `GET /api/posts/:id` - Get single post (public if published)
- `GET /api/posts/my/drafts` - Get user's drafts (auth required)
- `POST /api/posts` - Create new post/draft (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)
- `POST /api/posts/:id/publish` - Publish draft (auth required)

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)
- **Validation**: express-validator
