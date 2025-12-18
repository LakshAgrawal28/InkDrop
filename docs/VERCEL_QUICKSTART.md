# Vercel Deployment Quick Start

## 🚀 Quick Deploy (5 Minutes)

### 1. Database Setup (Choose One)

#### Neon (Recommended - Fastest)
```powershell
# 1. Go to: https://neon.tech
# 2. Sign in with GitHub
# 3. Click "Create Project"
# 4. Copy the connection string
```

#### Supabase ⭐ Recommended for beginners
```powershell
# 1. Go to: https://supabase.com
# 2. Sign in with GitHub
# 3. Create new project (save password!)
# 4. Settings → Database → Connection string
# 5. Copy "Connection Pooling" (Transaction mode, port 6543)
# 6. Format: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres

# IMPORTANT: 
# - Use port 6543 (pooling) for Vercel
# - Use port 5432 (direct) for migrations

# See full guide: SUPABASE_SETUP.md
```

### 2. Deploy Backend

```powershell
# Option A: Via Vercel Dashboard (Recommended)
# 1. Go to https://vercel.com/new
# 2. Import your GitHub repo
# 3. Root Directory: backend
# 4. Add environment variables (see below)
# 5. Deploy

# Option B: Via CLI
cd backend
vercel
# Follow prompts, then add env vars in dashboard
```

**Environment Variables for Backend:**
```
NODE_ENV=production
DATABASE_URL=postgresql://...  # from step 1
JWT_SECRET=<generate-64-char-string>
JWT_REFRESH_SECRET=<generate-64-char-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=https://your-app.vercel.app  # will update after frontend deploy
```

**For Supabase users, use this format:**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

**Generate secrets:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

### 3. Migrate Database

```powershell
cd backend
# For Supabase: Use port 5432 (direct connection) for migrations
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
npm run db:migrate
```

**Note:** Migrations use port 5432 (direct), but Vercel uses port 6543 (pooling).

### 4. Deploy Frontend

```powershell
# Via Vercel Dashboard (Recommended)
# 1. Go to https://vercel.com/new
# 2. Import same GitHub repo
# 3. Root Directory: frontend
# 4. Framework: Vite
# 5. Add environment variable:
#    VITE_API_URL=https://your-backend.vercel.app
# 6. Deploy
```

### 5. Update Backend CORS

```powershell
# 1. Go to backend project in Vercel
# 2. Settings → Environment Variables
# 3. Update FRONTEND_URL to your frontend URL
# 4. Click "Redeploy" button
```

---

## ✅ Verification

### Test Backend:
```powershell
curl https://your-backend.vercel.app/health
```

### Test Frontend:
Open `https://your-frontend.vercel.app` and register a user

---

## 🔧 Troubleshooting

### "Module not found" error
Move TypeScript types from `devDependencies` to `dependencies`:
```powershell
cd backend
npm install --save @types/node @types/express @types/bcryptjs @types/cors @types/jsonwebtoken @types/pg @types/uuid
```

### Database migration fails
Check your DATABASE_URL format:
```
# For migrations (port 5432):
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# For Vercel production (port 6543):
postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### CORS errors
1. Verify FRONTEND_URL in backend matches your frontend URL exactly
2. Check backend CORS config includes credentials: true
3. Redeploy backend after changing env vars

---

## 📊 Project Structure After Setup

```
InkDrop/
├── backend/
│   ├── vercel.json          ✅ Created
│   ├── package.json          ✅ Updated
│   └── src/
│       └── server.ts         ✅ Updated (exports app)
└── frontend/
    └── (no changes needed - Vite auto-configured)
```

---

## 🎯 Next Steps

1. Configure custom domain (optional)
2. Set up preview deployments for PRs
3. Add monitoring (Vercel Analytics)
4. Consider Vercel Pro for better performance

---

## 💡 Tips

- **Auto-deploy:** Push to GitHub main branch → Auto deployment
- **Preview deploys:** Every PR gets a preview URL
- **Env vars:** Can be scoped to production/preview/development
- **Logs:** Check Vercel dashboard → Project → Deployments → View logs

---

## 🆘 Need Help?

See full guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
