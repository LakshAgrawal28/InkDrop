# InkDrop Frontend

Draft-first blogging platform frontend built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 JWT-based authentication
- ✍️ Markdown editor with autosave
- 📝 Draft management
- 📖 Clean reading experience
- 🎨 Beautiful, calm UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/      # Reusable components (Navbar, etc.)
├── contexts/        # React contexts (AuthContext)
├── lib/            # Utilities (API client)
├── pages/          # Page components
├── services/       # API services
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Routes

- `/` - Home page (published posts)
- `/post/:slug` - Individual post view
- `/login` - Login page
- `/register` - Registration page
- `/editor` - Post editor (protected)
- `/drafts` - User's drafts (protected)

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Markdown**: react-markdown
- **HTTP**: Axios
