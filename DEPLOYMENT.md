# InkDrop Deployment Guide

## Option 1: Render (Recommended - Full Stack with Database)

### Prerequisites
- GitHub account
- Render account (free): https://render.com
- Code pushed to GitHub repository

### Manual Deployment Steps (RECOMMENDED):

#### Step 1: Create PostgreSQL Database

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `inkdrop-db`
   - **Database:** `inkdrop` (or leave default)
   - **User:** `inkdrop` (or leave default)
   - **Region:** Choose closest to you
   - **Plan:** **Free** (0.1 GB storage)
4. Click **"Create Database"**
5. Wait for database to be ready (~1 minute)
6. Copy the **"Internal Database URL"** (starts with `postgresql://`)

#### Step 2: Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `inkdrop-backend`
   - **Region:** Same as database
   - **Branch:** `main` (or your branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** **Free** (512 MB RAM)
4. Click **"Advanced"** → **"Add Environment Variable"** and add:
   ```
   NODE_ENV = production
   PORT = 3000
   DATABASE_URL = [paste Internal Database URL from Step 1]
   JWT_ACCESS_SECRET = [generate random 64-char string]
   JWT_REFRESH_SECRET = [generate random 64-char string]
   JWT_ACCESS_EXPIRY = 15m
   JWT_REFRESH_EXPIRY = 7d
   FRONTEND_URL = http://localhost:3000
   ```
   
   **Generate secrets in PowerShell:**
   ```powershell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
   ```
   Run this twice to get two different secrets.

5. Click **"Create Web Service"**
6. Wait for deployment (~3-5 minutes)
7. **Copy your backend URL** (e.g., `https://inkdrop-backend-xyz.onrender.com`)

#### Step 3: Run Database Migration

1. Go to your backend service dashboard
2. Click **"Shell"** tab (left sidebar)
3. Wait for shell to connect
4. Run:
   ```bash
   npm run db:migrate
   ```
5. Verify success - should see "Migration completed successfully"

#### Step 4: Deploy Frontend Service

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `inkdrop-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** **Free** (100 GB bandwidth)
4. Click **"Advanced"** → **"Add Environment Variable"**:
   ```
   VITE_API_URL = [paste your backend URL from Step 2]
   ```
   Example: `https://inkdrop-backend-xyz.onrender.com`

5. Add **Rewrite Rules** (for SPA routing):
   - Click **"Redirects/Rewrites"**
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`

6. Click **"Create Static Site"**
7. Wait for deployment (~2-3 minutes)
8. **Copy your frontend URL** (e.g., `https://inkdrop-frontend-xyz.onrender.com`)

#### Step 5: Update Backend CORS

1. Go back to backend service
2. Click **"Environment"** tab
3. Update the **FRONTEND_URL** variable:
   ```
   FRONTEND_URL = [paste your frontend URL from Step 4]
   ```
4. Service will auto-redeploy (~1 minute)

#### Step 6: Test Your Application

1. Open your frontend URL
2. Register a new account
3. Create a draft post
4. Publish the post
5. Test dark mode toggle
6. Test animations (snowfall, ripples)

**🎉 Your app is live!**

---

### Blueprint Deployment (Alternative - if manual works):

If you prefer automated deployment after fixing issues:

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Frontend on Vercel

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy Frontend
```bash
cd frontend
vercel
# Follow prompts:
# - Link to existing project? No
# - Project name: inkdrop-frontend
# - Directory: ./
# - Override settings? Yes
#   - Build Command: npm run build
#   - Output Directory: dist
```

#### 3. Add Environment Variable
```bash
vercel env add VITE_API_URL
# Enter: https://your-backend.onrender.com
```

#### 4. Redeploy
```bash
vercel --prod
```

### Backend on Render
Follow Option 1's backend steps (database + backend service)

---

## Option 3: Railway (Alternative Full Stack)

### Prerequisites
- Railway account: https://railway.app

### Steps:

1. **Create New Project:**
   - Go to https://railway.app/dashboard
   - New Project → Deploy from GitHub repo
   - Connect your repository

2. **Add PostgreSQL:**
   - Add service → Database → PostgreSQL
   - Note the connection string

3. **Configure Backend Service:**
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - Variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=[generate]
     JWT_REFRESH_SECRET=[generate]
     NODE_ENV=production
     PORT=3000
     ```
   - Generate Domain

4. **Configure Frontend Service:**
   - New Service → Empty Service
   - Settings:
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Start Command: `npx vite preview --host 0.0.0.0 --port $PORT`
   - Variables:
     ```
     VITE_API_URL=https://[your-backend].railway.app
     ```
   - Generate Domain

5. **Run Migration:**
   - Backend service → Shell
   - Run: `npm run db:migrate`

---

## Option 4: Netlify (Frontend) + Render (Backend)

### Frontend on Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Deploy:**
```bash
cd frontend
netlify deploy --prod
# Build command: npm run build
# Publish directory: dist
```

3. **Environment Variables:**
   - Site Settings → Build & Deploy → Environment
   - Add: `VITE_API_URL` = your backend URL

4. **Redirects for SPA:**
Create `frontend/public/_redirects`:
```
/*  /index.html  200
```

### Backend on Render
Follow Option 1's backend steps

---

## Post-Deployment Steps

### 1. Update CORS in Backend
Edit `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'https://your-frontend.netlify.app',
    'https://your-frontend.onrender.com',
    // Add your actual frontend URL
  ],
  credentials: true
}));
```

### 2. Test the Application
- Register a new user
- Create a draft
- Publish a post
- Test dark mode
- Test animations

### 3. Custom Domain (Optional)
- **Vercel/Netlify:** Project Settings → Domains
- **Render:** Service Settings → Custom Domain

---

## Environment Variables Quick Reference

### Backend
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
```

### Frontend
```env
VITE_API_URL=https://your-backend-url.com
```

---

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database service is running
- Ensure migrations have run

### Build Failures
- Check Node version (use 18.x or higher)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### CORS Errors
- Update backend CORS origin with frontend URL
- Ensure credentials: true in both ends

### API Connection Issues
- Verify VITE_API_URL is set correctly
- Check backend service is running
- Test API endpoint directly

---

## Cost Summary

### Free Tiers Available:
- **Render:** Free (750 hours/month, sleeps after inactivity)
- **Vercel:** Free (100GB bandwidth, unlimited projects)
- **Netlify:** Free (100GB bandwidth)
- **Railway:** $5 free credit/month

### Recommended for Production:
- **Render:** $7/month for always-on backend
- **Vercel:** $20/month for Pro features
- Keep database on free tier initially

---

## Generate Secrets

Use this in PowerShell to generate secure secrets:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

Or in Node.js:
```javascript
require('crypto').randomBytes(64).toString('hex')
```
