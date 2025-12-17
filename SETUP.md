# InkDrop Setup Guide

Quick setup instructions to get InkDrop running locally.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18 or higher (`node --version`)
- ✅ PostgreSQL 14 or higher (`psql --version`)
- ✅ npm or yarn (`npm --version`)

## Step-by-Step Setup

### 1. Database Setup (5 minutes)

```bash
# Option A: Using createdb command
createdb inkdrop

# Option B: Using psql
psql -U postgres
# Inside psql:
CREATE DATABASE inkdrop;
\q
```

**Verify database exists:**
```bash
psql -U postgres -l | grep inkdrop
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env` file:**
```bash
# Update these values:
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/inkdrop
JWT_ACCESS_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=another-random-secret-key-here
```

**Generate secure secrets (optional):**
```bash
# In terminal/PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and use as JWT secrets
```

**Run database migrations:**
```bash
npm run db:migrate
```

**Expected output:**
```
✓ Users table created
✓ Posts table created
✓ Refresh tokens table created
✓ Indexes created
✅ Migration completed successfully
```

**Start backend server:**
```bash
npm run dev
```

**Expected output:**
```
🚀 InkDrop backend running on port 5000
📝 Environment: development
🔗 CORS enabled for: http://localhost:3000
✓ Database connected
```

### 3. Frontend Setup (3 minutes)

**Open a new terminal window:**

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**The default `.env` should work as-is:**
```bash
VITE_API_URL=http://localhost:5000/api
```

**Start frontend server:**
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 4. Test the Application

Open your browser to http://localhost:3000

**Test flow:**
1. Click "Sign Up" in the top right
2. Create an account:
   - Email: test@example.com
   - Username: testuser
   - Password: testpass123
3. Click "New Post" to create your first draft
4. Write something and watch it autosave
5. Click "Publish" to make it public
6. View your post on the home page

## Troubleshooting

### Backend won't start

**Error: "database connection failed"**
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service -Name postgresql*

# Start if not running:
Start-Service postgresql-x64-14
```

**Error: "Database does not exist"**
```bash
# Recreate database
createdb inkdrop
cd backend
npm run db:migrate
```

### Frontend won't start

**Error: "Cannot connect to backend"**
- Check if backend is running on port 5000
- Verify VITE_API_URL in frontend/.env
- Check browser console for CORS errors

### Database migration fails

**Error: "relation already exists"**
```bash
# Drop all tables and recreate
psql -U postgres -d inkdrop
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
\q

# Re-run migration
npm run db:migrate
```

## Quick Commands Reference

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start           # Run production build
npm run db:migrate  # Run database migrations
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/inkdrop
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Next Steps

Once everything is running:

1. **Explore the editor** - Try markdown formatting
2. **Create multiple posts** - Test the drafts system
3. **Read the code** - Start with backend/src/server.ts
4. **Customize styles** - Edit frontend/src/index.css
5. **Add features** - See README.md for ideas

## Getting Help

Common issues:
- Port 5000 already in use? Change PORT in backend/.env
- Port 3000 already in use? Vite will auto-suggest 3001
- Database connection issues? Check PostgreSQL is running
- CORS errors? Verify FRONTEND_URL matches your frontend URL

## Project Structure

```
InkDrop/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── db/             # Database connection & migrations
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── contexts/       # React contexts
    │   ├── lib/           # Utilities
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── App.tsx        # Root component
    │   └── main.tsx       # Entry point
    ├── package.json
    └── vite.config.ts
```

Happy coding! 🚀
