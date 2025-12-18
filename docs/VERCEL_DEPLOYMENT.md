# InkDrop Vercel Deployment Guide

## Overview
Vercel is optimized for frontend deployments but can also host serverless backend APIs. This guide covers deploying your full-stack InkDrop application.

## Architecture
- **Frontend:** Vercel (Static Site)
- **Backend:** Vercel Serverless Functions
- **Database:** External PostgreSQL (Neon, Supabase, or Railway)

---

## Step 1: Set Up PostgreSQL Database

Vercel doesn't provide managed databases, so use a free PostgreSQL provider:

### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Sign up/Login with GitHub
3. Create new project: **"inkdrop-db"**
4. Copy the **Connection String** (starts with `postgresql://`)

### Option B: Supabase ⭐ Great UI
1. Go to https://supabase.com
2. Sign in with GitHub
3. Create new project (choose region close to you)
4. Wait 2-3 minutes for provisioning
5. Go to **Settings** (gear icon) → **Database**
6. Scroll to **"Connection string"** section
7. Copy **"Connection Pooling"** string (Transaction mode, port 6543)
   - Format: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres`
   - Replace `[PASSWORD]` with your database password
   - **Important:** Use port **6543** (pooling) for Vercel, port **5432** for migrations

**See detailed guide:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### Option C: Railway
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy **Connection URL**

---

## Step 2: Prepare Backend for Vercel Serverless

### 2.1: Create Vercel Configuration

Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

### 2.2: Update Backend Package.json

Add to scripts in `backend/package.json`:
```json
"vercel-build": "npm run build"
```

### 2.3: Create API Entry Point

Create `backend/api/index.ts`:
```typescript
import app from '../src/server';

export default app;
```

### 2.4: Update server.ts

Modify `backend/src/server.ts` to export the app (if not already):
```typescript
// At the end of server.ts
export default app;

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

---

## Step 3: Deploy Backend to Vercel

### 3.1: Install Vercel CLI (Optional)
```powershell
npm install -g vercel
```

### 3.2: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. Click **"Environment Variables"** and add:
   ```
   NODE_ENV = production
   DATABASE_URL = [your PostgreSQL connection string]
   JWT_SECRET = [64-char random string]
   JWT_REFRESH_SECRET = [64-char random string]
   JWT_ACCESS_EXPIRY = 15m
   JWT_REFRESH_EXPIRY = 7d
   FRONTEND_URL = [will add after frontend deployment]
   ```
   
   **Generate secrets in PowerShell:**
   ```powershell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
   ```

6. Click **"Deploy"**
7. Wait for deployment (~2-3 minutes)
8. **Copy your backend URL** (e.g., `https://inkdrop-backend.vercel.app`)

### 3.3: Run Database Migration

Option 1 - Local migration (recommended):
```powershell
cd backend
# For Supabase: Use port 5432 (NOT 6543) for migrations
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
npm run db:migrate
```

Option 2 - Via Vercel CLI:
```powershell
cd backend
vercel env pull .env.local
npm run db:migrate
```

---

## Step 4: Deploy Frontend to Vercel

### 4.1: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository (or add new project)
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Click **"Environment Variables"** and add:
   ```
   VITE_API_URL = [your backend URL from Step 3]
   ```
   Example: `https://inkdrop-backend.vercel.app`

6. Click **"Deploy"**
7. Wait for deployment (~1-2 minutes)
8. **Copy your frontend URL** (e.g., `https://inkdrop.vercel.app`)

### 4.2: Update Backend CORS

1. Go to your **backend** project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Update `FRONTEND_URL` to your frontend URL
4. Click **"Redeploy"** to apply changes

---

## Step 5: Configure Custom Domain (Optional)

### For Frontend:
1. Go to frontend project → **Settings** → **Domains**
2. Add your domain (e.g., `inkdrop.com`)
3. Update DNS records as shown
4. Wait for SSL certificate (~5 minutes)

### For Backend:
1. Go to backend project → **Settings** → **Domains**
2. Add subdomain (e.g., `api.inkdrop.com`)
3. Update DNS records
4. Update `VITE_API_URL` in frontend environment variables
5. Redeploy frontend

---

## Step 6: Verify Deployment

### Test Backend:
```powershell
curl https://your-backend.vercel.app/api/health
```

### Test Frontend:
1. Open `https://your-frontend.vercel.app`
2. Try registering a new user
3. Create a draft post
4. Publish and view a post

---

## Troubleshooting

### Backend Issues

**Error: "Module not found"**
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Check `tsconfig.json` for correct output directory

**Database Connection Timeout**
- Verify `DATABASE_URL` is correct
- Check if database allows external connections
- Add Vercel IPs to database allowlist if needed

**Cold Start Issues**
- Serverless functions sleep after inactivity
- First request may take 3-5 seconds
- Consider upgrading to Vercel Pro for better performance

### Frontend Issues

**API Calls Failing**
- Check `VITE_API_URL` environment variable
- Verify backend CORS settings include frontend URL
- Check browser console for errors

**404 on Page Refresh**
- Vercel automatically handles SPA rewrites for Vite
- Check `frontend/public/_redirects` exists

---

## Continuous Deployment

Both projects are now connected to GitHub:
- **Push to main branch** → Automatic deployment
- **Pull requests** → Preview deployments
- **Check deployment status** in Vercel dashboard

---

## Environment Variables Summary

### Backend
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-64-char-secret
JWT_REFRESH_SECRET=your-64-char-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

## Key Differences from Render

| Feature | Render | Vercel |
|---------|--------|--------|
| Backend | Always-on container | Serverless functions |
| Cold starts | No | Yes (~3-5s) |
| Database | Managed PostgreSQL | External provider needed |
| Deployment speed | 3-5 min | 30s-2min |
| Free tier limits | 512 MB RAM | 100 GB bandwidth |
| Custom domains | ✅ Yes | ✅ Yes |
| Auto HTTPS | ✅ Yes | ✅ Yes |

---

## Cost Comparison (Monthly)

### Free Tier
- **Render:** 750 hours/month (enough for 1 backend + 1 frontend)
- **Vercel:** 100 GB bandwidth, 100 GB-hours serverless

### Paid Plans
- **Render Hobby:** $7/month per service
- **Vercel Pro:** $20/month (unlimited projects)

---

## Migration Checklist

- [ ] Create PostgreSQL database (Neon/Supabase/Railway)
- [ ] Run database migrations
- [ ] Deploy backend to Vercel
- [ ] Test backend API endpoints
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings
- [ ] Test full application flow
- [ ] Configure custom domain (optional)
- [ ] Remove/pause Render services

---

## Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Neon Database:** https://neon.tech/docs
- **Vercel Discord:** https://vercel.com/discord
- **GitHub Issues:** Report issues in your repository

---

**Need help?** Check the [Vercel Community](https://github.com/vercel/vercel/discussions) or create an issue in your repository.
