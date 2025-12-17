# InkDrop API Examples

Example HTTP requests for testing the InkDrop API. Use with curl, Postman, or your favorite HTTP client.

## Base URL
```
http://localhost:5000/api
```

---

## Authentication

### 1. Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice",
    "password": "securepass123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "alice@example.com",
    "username": "alice",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

### 3. Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Access Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Posts

### 6. Create New Post (Draft)

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "# Hello World\n\nThis is my **first post** on InkDrop!\n\n## Features I Love\n\n- Markdown support\n- Autosave\n- Clean design",
    "excerpt": "An introduction to my blogging journey"
  }'
```

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "post-uuid",
    "author_id": "user-uuid",
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "# Hello World...",
    "excerpt": "An introduction to my blogging journey",
    "is_published": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Update Post

```bash
curl -X PUT http://localhost:5000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Updated Blog Post",
    "content": "# Hello World (Updated)\n\nThis is my updated content!"
  }'
```

### 8. Publish Post

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/publish \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9. Unpublish Post

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/unpublish \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10. Get All Published Posts (Public)

```bash
curl -X GET "http://localhost:5000/api/posts?limit=10&offset=0"
```

**Response:**
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "title": "My First Blog Post",
      "slug": "my-first-blog-post",
      "content": "# Hello World...",
      "excerpt": "An introduction to my blogging journey",
      "is_published": true,
      "published_at": "2024-01-01T12:00:00.000Z",
      "author": {
        "id": "user-uuid",
        "username": "alice",
        "email": "alice@example.com"
      }
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "count": 1
  }
}
```

### 11. Get Single Post by Slug (Public)

```bash
curl -X GET http://localhost:5000/api/posts/my-first-blog-post
```

### 12. Get My Drafts (Private)

```bash
curl -X GET http://localhost:5000/api/posts/my/drafts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 13. Delete Post

```bash
curl -X DELETE http://localhost:5000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Complete Workflow Example

### Step 1: Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"test1234"}'
```

Copy the `accessToken` from response.

### Step 2: Create Draft
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learning InkDrop",
    "content": "## What I learned today\n\n- How to use the API\n- How autosave works\n- How to publish posts"
  }'
```

Copy the `post.id` from response.

### Step 3: Publish Post
```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/publish \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 4: View Published Post
```bash
curl -X GET http://localhost:5000/api/posts
```

---

## PowerShell Examples (Windows)

### Register User
```powershell
$body = @{
    email = "test@example.com"
    username = "testuser"
    password = "test1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Create Post
```powershell
$token = "YOUR_ACCESS_TOKEN"
$body = @{
    title = "My Post"
    content = "# Hello from PowerShell!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/posts" `
  -Method Post `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body $body
```

---

## Testing with Postman

### 1. Import Collection

Create a new Postman collection with these variables:
- `base_url`: http://localhost:5000/api
- `access_token`: (empty, will be filled after login)
- `refresh_token`: (empty, will be filled after login)
- `post_id`: (empty, will be filled after creating post)

### 2. Authentication Flow

1. Register → Save `accessToken` to collection variable
2. Use `{{access_token}}` in Authorization header for protected routes

### 3. Post Flow

1. Create Post → Save `post.id` to `post_id` variable
2. Update Post using `{{post_id}}`
3. Publish Post using `{{post_id}}`
4. View post in public feed

---

## Common HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not authorized for action |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email/username/slug |
| 500 | Server Error | Something went wrong |

---

## Error Response Format

All errors follow this format:
```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Examples:

**Validation Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

**Authentication Error:**
```json
{
  "error": "Authentication failed",
  "message": "Invalid or expired token"
}
```

**Not Found Error:**
```json
{
  "error": "Not Found",
  "message": "Post not found"
}
```

---

## Tips for Testing

1. **Save your tokens** - Store accessToken and refreshToken after login
2. **Test validation** - Try invalid emails, short passwords, etc.
3. **Test authorization** - Try accessing others' posts
4. **Test edge cases** - Empty strings, very long content, special characters
5. **Monitor autosave** - Create post, wait, check updated_at timestamp

## Health Check

Quick way to verify backend is running:
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```
