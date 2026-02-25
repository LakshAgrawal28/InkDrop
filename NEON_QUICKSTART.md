# 🚀 Neon Quick Start - InkDrop

Based on your Neon dashboard screenshot, here's what you need to do RIGHT NOW to get InkDrop running on Neon DB:

## ✅ Your Neon Setup (Already Done!)

- ✓ Project created
- ✓ Database: `neondb`
- ✓ Region: ap-southeast-1 (Singapore)
- ✓ Connection pooling: **ENABLED** ✓
- ✓ Role: `neondb_owner`

## 🎯 Next Steps (5 minutes)

### Step 1: Copy Your Connection String

From your Neon dashboard (the screenshot you shared), click **"Copy snippet"** to copy:

```
postgresql://neondb_owner:****************@ep-nameless-wildflower-a131qmlf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Step 2: Update Your Backend `.env`

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create your `.env` file:
   ```bash
   copy .env.example .env
   ```
   (Or on Mac/Linux: `cp .env.example .env`)

3. Open `backend/.env` in your editor and paste your Neon connection string:
   ```dotenv
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Database - Neon (Paste your FULL connection string here)
   DATABASE_URL=postgresql://neondb_owner:YOUR_ACTUAL_PASSWORD@ep-nameless-wildflower-a131qmlf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   
   # JWT Secrets (Change these to random strings!)
   JWT_ACCESS_SECRET=change-this-to-something-random-and-secure
   JWT_REFRESH_SECRET=change-this-to-another-random-secure-string
   
   # JWT Expiry
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

   **IMPORTANT**: Replace `YOUR_ACTUAL_PASSWORD` with the actual password from your connection string!

### Step 3: Run Database Migrations

Still in the `backend` folder:

```bash
# Install dependencies (if you haven't)
npm install

# Run migrations to create tables
npm run db:migrate
```

**Expected output:**
```
Starting database migration...
✓ Users table created
✓ Posts table created
✓ Refresh tokens table created
✓ Indexes created
✅ Migration completed successfully
```

### Step 4: Start Your Backend

```bash
npm run dev
```

**Expected output:**
```
✓ Database connected
Server running on port 5000
```

### Step 5: Test It Works

Open a new terminal and test the API:

```bash
# Test health endpoint (if you have one)
curl http://localhost:5000/api/auth/register -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"Test123456\"}"
```

Or just open your frontend and try registering a user!

---

## 🎉 Done!

Your InkDrop is now running on **Neon DB**! 

### What This Means:

✅ **Permanent database** - Never pauses (perfect for resume)  
✅ **Free forever** - No credit card needed  
✅ **Production-ready** - Serverless PostgreSQL  
✅ **Easy deployment** - Just add the same `DATABASE_URL` to Vercel/Netlify  

---

## 🚀 Next Steps for Your Resume Project

1. **Deploy Backend to Vercel:**
   - Push code to GitHub
   - Import to Vercel
   - Add the same environment variables from your `.env`
   - Deploy!

2. **Deploy Frontend to Vercel/Netlify:**
   - Update `VITE_API_URL` to your deployed backend URL
   - Deploy!

3. **Add to Your Resume:**
   - ✓ Live project URL
   - ✓ GitHub repository
   - ✓ Tech stack: React, TypeScript, Express, PostgreSQL (Neon), Tailwind CSS

---

## ❓ Need Help?

See the full detailed guide: [NEON_MIGRATION.md](docs/NEON_MIGRATION.md)

## 🐛 Troubleshooting

**"Database connection failed"**
- Make sure you copied the FULL connection string including `?sslmode=require&channel_binding=require`
- Check your Neon compute is Active (green dot in dashboard)

**"Migration failed"**
- Make sure you're using `neondb_owner` role (not a read-only user)
- Check the connection string password is correct

**"Cannot find module"**
- Run `npm install` in the backend folder first

---

Ready? Let's go! 🚀
