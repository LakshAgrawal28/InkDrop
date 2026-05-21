# InkDrop 🖋️

A **draft-first, distraction-free blogging platform** with a premium Swiss-minimalist design. Write in Markdown, publish when ready.

> Built with ❤️ by [Laksh Agrawal](https://lakshdoes.tech)

---

## ✨ Features

**For Writers**
- ✍️ Markdown editor with live preview & formatting toolbar
- 💾 Autosave — never lose your work
- 📝 Draft management — keep posts private until ready
- 🖼️ Image uploads via Cloudinary
- 🚀 One-click publish

**For Readers**
- 📖 Clean, typography-focused reading experience
- 🎨 Customizable reading preferences (font family & text scale)
- 🌗 Light & dark mode
- 📱 Fully responsive

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | JWT (access + refresh tokens) |
| **Storage** | Cloudinary (images) |
| **Hosting** | Netlify (frontend) + Render/Railway (backend) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL or [Neon](https://neon.tech) account

### Setup

```bash
# Clone
git clone https://github.com/LakshAgrawal28/InkDrop.git
cd InkDrop

# Backend
cd backend
npm install
# Create .env with DATABASE_URL, JWT secrets, Cloudinary keys
npm run db:migrate
npm run dev          # → http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
# Create .env with VITE_API_URL=http://localhost:5000/api
npm run dev          # → http://localhost:3001
```

## 📡 API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register |
| `POST` | `/api/auth/login` | — | Login |
| `POST` | `/api/auth/refresh` | — | Refresh token |
| `GET` | `/api/posts` | — | List published posts |
| `GET` | `/api/posts/:slug` | — | Read post |
| `POST` | `/api/posts` | ✅ | Create draft |
| `PUT` | `/api/posts/:id` | ✅ | Update post |
| `POST` | `/api/posts/:id/publish` | ✅ | Publish draft |
| `DELETE` | `/api/posts/:id` | ✅ | Delete post |
| `POST` | `/api/upload` | ✅ | Upload image |

## 📄 License

MIT
