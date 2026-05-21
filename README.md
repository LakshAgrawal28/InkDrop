# InkDrop

A draft-first, distraction-free blogging platform built for focused writing and clean publishing.

InkDrop is designed around a simple workflow: write privately, refine your thoughts, and publish only when you're ready.

---

## Overview

InkDrop combines a minimalist writing experience with a modern full-stack architecture. It provides Markdown-based writing, autosaved drafts, image uploads, authentication, and a polished reading interface optimized for clarity and typography.

---

## Features

### Writing Experience
- Markdown editor with live preview
- Formatting toolbar
- Draft-first workflow
- Autosave support
- One-click publish/unpublish
- Image uploads with Cloudinary

### Reading Experience
- Minimal, typography-focused UI
- Light and dark themes
- Adjustable reading preferences
- Fully responsive layout

### Authentication & Security
- JWT authentication
- Access + refresh token flow
- Protected routes and APIs
- Input validation and secure API design

---

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript

### Database & Storage
- PostgreSQL (Neon)
- Cloudinary

### Deployment
- Netlify / Vercel (Frontend)
- Render / Railway (Backend)

---

## Project Structure

```bash
InkDrop/
├── frontend/          # React frontend
├── backend/           # Express backend
├── docs/              # Screenshots / assets
└── README.md
