# InkDrop Deployment Guide

## Option 1: Render (Recommended - Full Stack with Database)

### Prerequisites
- GitHub account
- Render account (free): https://render.com

### Steps:

#### 1. Push to GitHub
```bash
cd "c:\Users\LAKSH AGRAWAL\Desktop\VSCode\InkDrop"
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/inkdrop.git
git push -u origin main
```

#### 2. Create Environment Files

Create `backend/.env.production`:
```env
NODE_ENV=production
PORT=3000
# These will be set by Render:
# DATABASE_URL=
# JWT_SECRET=
# JWT_REFRESH_SECRET=
```

#### 3. Deploy on Render

**Option A: Blueprint (Automatic)**
1. Go to https://render.com/dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create all services
5. Review and click "Apply"

**Option B: Manual Setup**
1. **Create PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `inkdrop-db`
   - Choose Free plan
   - Copy the "Internal Database URL"

2. **Deploy Backend:**
   - New → Web Service
   - Connect your GitHub repo
   - Name: `inkdrop-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add Environment Variables:
     ```
     DATABASE_URL = [paste internal database URL]
     JWT_SECRET = [generate random 64-char string]
     JWT_REFRESH_SECRET = [generate random 64-char string]
     NODE_ENV = production
     ```

3. **Deploy Frontend:**
   - New → Static Site
   - Connect your GitHub repo
   - Name: `inkdrop-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add Environment Variable:
     ```
     VITE_API_URL = https://inkdrop-backend.onrender.com
     ```
   - Add Rewrite Rule: `/*` → `/index.html`

4. **Run Database Migration:**
   - Go to backend service dashboard
   - Shell tab
   - Run: `npm run db:migrate`

#### 4. Update Frontend API URL
After backend deploys, update frontend env var with actual backend URL.

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
