# 🚀 Neon Database Migration Guide

Welcome! This guide helps you migrate InkDrop from a local PostgreSQL or Supabase setup to **Neon DB** - the perfect serverless PostgreSQL solution for resume/portfolio projects.

## ✨ Why Neon?

| Feature | Neon Free Tier | Supabase Free |
|---------|----------------|---------------|
| **Projects** | Unlimited | 2 organizations |
| **Pausing** | Never pauses | After 7 days inactivity |
| **Storage** | 512 MB | 500 MB |
| **Compute** | 0.5 GB RAM | 500 MB RAM |
| **SSL** | Built-in | Built-in |
| **Best For** | Portfolio/Resume projects | Active development |

**Perfect for your resume** - Your project stays active permanently, no more "project paused" errors when recruiters view your work!

---

## 📋 Prerequisites

- Your InkDrop project (already set up ✓)
- A Neon account (free, no credit card needed)

---

## 🎯 Step-by-Step Migration

### Step 1: Create Neon Account & Database (5 minutes)

1. **Sign up at [console.neon.tech](https://console.neon.tech/)**
   - Click "Sign up" (use GitHub for faster signup)
   - No credit card required

2. **Create a new project:**
   - Click "Create a project"
   - Choose a name: `inkdrop` or `inkdrop-portfolio`
   - Select region: **ap-southeast-1** (Asia Pacific - Singapore)
   - Click "Create Project"

3. **Get your connection string:**
   - After creation, you'll see "Connect to your database"
   - Set **Connection pooling** to **ON** (toggle the switch)
   - Your connection string will look like:
     ```
     postgresql://neondb_owner:************@ep-nameless-wildflower-a131qmlf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```
   - Click "Copy snippet" to copy the full connection string

### Step 2: Update Backend Configuration

1. **Navigate to your backend folder:**
   ```bash
   cd backend
   ```

2. **Create or update your `.env` file:**
   ```bash
   # Copy from example if you don't have .env yet
   cp .env.example .env
   ```

3. **Edit `backend/.env` and update the DATABASE_URL:**
   ```dotenv
   # Server
   PORT=5000
   NODE_ENV=production
   
   # Database - Neon (Paste your connection string from Neon dashboard)
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD_HERE@ep-nameless-wildflower-a131qmlf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   
   # JWT Secrets (IMPORTANT: Generate new secure keys for production!)
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-to-random-string
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-to-random-string
   
   # JWT Expiry
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   
   # CORS (Update with your deployed frontend URL)
   FRONTEND_URL=http://localhost:3000
   ```

   **⚠️ Security Tips:**
   - Never commit your `.env` file to Git
   - Generate random JWT secrets: Use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - Update `FRONTEND_URL` when you deploy your frontend

### Step 3: Run Database Migrations

This creates all the tables (users, posts, refresh_tokens) in your Neon database:

```bash
# Install dependencies if you haven't
npm install

# Run migrations
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

### Step 4: Test the Connection

Start your backend server:

```bash
npm run dev
```

**Expected output:**
```
✓ Database connected
Server running on port 5000
```

If you see this, congratulations! 🎉 Your migration is complete.

---

## 🔄 Migrating Existing Data (Optional)

If you have existing data from Supabase or local PostgreSQL that you want to migrate:

### Option 1: Using pg_dump (Recommended)

```bash
# 1. Export data from your old database
pg_dump "your-old-connection-string" --data-only --no-owner --no-acl > data_backup.sql

# 2. Import to Neon
psql "your-neon-connection-string" < data_backup.sql
```

### Option 2: Manual Export/Import

1. Export data from your old database to JSON/CSV
2. Create a seed script to import into Neon
3. Run the seed script

---

## 🌐 Deploying Your Project

### Backend Deployment (Vercel - Recommended)

Your backend is already configured for Vercel! Just add the environment variables:

1. **Push to GitHub** (if not already)
2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Set root directory to `backend`

3. **Add environment variables in Vercel:**
   ```
   DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler...
   JWT_ACCESS_SECRET=your-secret-here
   JWT_REFRESH_SECRET=your-secret-here
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   NODE_ENV=production
   ```

4. **Deploy!**

### Frontend Deployment (Vercel/Netlify)

1. Update `frontend/.env` with your deployed backend URL:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```

2. Deploy to Vercel or Netlify

---

## 🧪 Verification Checklist

- [ ] Neon project created
- [ ] Connection string copied and added to `.env`
- [ ] Database migrations ran successfully
- [ ] Backend starts without errors
- [ ] Can register a new user
- [ ] Can login with the user
- [ ] Can create a post
- [ ] Can view posts

---

## ❗ Troubleshooting

### Error: "database connection failed"

**Solution:**
- Check your connection string is correct (no extra spaces)
- Ensure you copied the **pooled connection** string (contains `-pooler`)
- Verify your Neon compute is **Active** (check Neon dashboard)

### Error: "SSL connection required"

**Solution:**
Your connection string must include `?sslmode=require&channel_binding=require` at the end.

### Error: "relation does not exist"

**Solution:**
You haven't run migrations yet:
```bash
npm run db:migrate
```

### Migration fails with "permission denied"

**Solution:**
- Ensure you're using the `neondb_owner` role (not the read-only role)
- Check in Neon dashboard: Connection Details → Role should be `neondb_owner`

### Compute is paused

**Solution:**
Neon free tier automatically pauses compute after 5 minutes of inactivity. It auto-resumes on first connection (takes ~1-2 seconds).

**For resume projects:** Consider keeping a simple health check endpoint or using a cron job to ping your API every few minutes if you want instant responsiveness.

---

## 📊 Monitoring Your Database

### Neon Dashboard Features

Access at [console.neon.tech](https://console.neon.tech):

1. **Metrics:** View queries, data size, and active sessions
2. **Query History:** See recent queries (helpful for debugging)
3. **Branches:** Create database branches for testing (like Git for your DB!)
4. **Backups:** Point-in-time restore available

### Useful SQL Queries

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;

-- View recent posts
SELECT id, title, author_id, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🎓 Best Practices for Resume Projects

1. **Keep it Active:**
   - Create a simple cron job or GitHub Action to ping your API daily
   - This prevents cold starts when recruiters visit

2. **Add Health Check Endpoint:**
   ```typescript
   // In your server.ts or routes
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });
   ```

3. **Environment Variables:**
   - Use different Neon projects for dev/staging/prod
   - Never commit `.env` files

4. **Database Backups:**
   - Neon provides automatic backups
   - Also export important data periodically to JSON

5. **Documentation:**
   - Keep this guide updated with any customizations
   - Document your deployed URLs in README

---

## 🆘 Need Help?

- **Neon Docs:** https://neon.tech/docs/introduction
- **Neon Discord:** https://discord.gg/neon
- **Project Issues:** Open an issue in your GitHub repo

---

## 🎉 Next Steps

Now that your database is on Neon:

1. ✅ **Deploy your backend** to Vercel
2. ✅ **Deploy your frontend** to Vercel/Netlify
3. ✅ **Update your resume/portfolio** with live project links
4. ✅ **Add database metrics** to impress recruiters
5. ✅ **Create seed data** for demo purposes

---

**Migration completed?** Great! Your InkDrop project is now running on professional-grade serverless PostgreSQL. 🚀

Remember: **Your database never pauses** - perfect for that resume project that needs to be always ready when recruiters click your link!
