# Supabase + Vercel Deployment - Visual Guide

## 🎯 Connection String Ports Explained

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE CONNECTIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PORT 5432 - Direct Connection                                  │
│  ├─ Use for: Local development                                  │
│  ├─ Use for: Database migrations                                │
│  └─ Format: postgresql://postgres:pass@db.xxx.co:5432/postgres  │
│                                                                 │
│  PORT 6543 - Connection Pooling (PgBouncer) ⭐                  │
│  ├─ Use for: Vercel serverless functions                        │
│  ├─ Use for: Production backend                                 │
│  └─ Format: postgresql://postgres:pass@db.xxx.co:6543/postgres  │
│            ?pgbouncer=true&connection_limit=1                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Step-by-Step Checklist

### Phase 1: Supabase Setup
```
☐ Go to https://supabase.com
☐ Sign in with GitHub
☐ Click "New Project"
☐ Choose region (e.g., us-east-1)
☐ Set database password (SAVE IT!)
☐ Wait 2-3 minutes for provisioning
☐ Go to Settings → Database
☐ Find "Connection string" section
☐ Copy BOTH connection strings:
   ☐ Session mode (port 5432) - for migrations
   ☐ Transaction mode (port 6543) - for Vercel
```

### Phase 2: Database Migration
```
☐ Open PowerShell
☐ cd backend
☐ Set environment variable:
   $env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
☐ Run: npm run db:migrate
☐ Verify in Supabase:
   ☐ Go to Table Editor
   ☐ See tables: users, posts, refresh_tokens
```

### Phase 3: Backend Deployment
```
☐ Go to https://vercel.com/new
☐ Import GitHub repository
☐ Set root directory: backend
☐ Add environment variables:
   ☐ NODE_ENV = production
   ☐ DATABASE_URL = postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   ☐ JWT_SECRET = [generate-64-chars]
   ☐ JWT_REFRESH_SECRET = [generate-64-chars]
   ☐ JWT_ACCESS_EXPIRY = 15m
   ☐ JWT_REFRESH_EXPIRY = 7d
   ☐ FRONTEND_URL = https://your-app.vercel.app (update later)
☐ Click Deploy
☐ Copy backend URL
```

### Phase 4: Frontend Deployment
```
☐ Go to https://vercel.com/new
☐ Import same GitHub repository
☐ Set root directory: frontend
☐ Set framework: Vite
☐ Add environment variable:
   ☐ VITE_API_URL = [your backend URL]
☐ Click Deploy
☐ Copy frontend URL
```

### Phase 5: Update CORS
```
☐ Go to backend project in Vercel
☐ Settings → Environment Variables
☐ Update FRONTEND_URL to actual frontend URL
☐ Click Redeploy
```

### Phase 6: Testing
```
☐ Test backend: curl https://your-backend.vercel.app/health
☐ Test frontend: Open https://your-frontend.vercel.app
☐ Register a new user
☐ Create a draft
☐ Publish a post
☐ View published post
```

## 🔑 Environment Variables Reference

### Backend (.env for local)
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:MyPassword@db.abc123.supabase.co:5432/postgres
JWT_SECRET=abc123xyz789...
JWT_REFRESH_SECRET=xyz789abc123...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
```

### Backend (Vercel)
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:MyPassword@db.abc123.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
JWT_SECRET=abc123xyz789...
JWT_REFRESH_SECRET=xyz789abc123...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=https://inkdrop.vercel.app
```

### Frontend (.env for local)
```env
VITE_API_URL=http://localhost:3000
```

### Frontend (Vercel)
```env
VITE_API_URL=https://inkdrop-backend.vercel.app
```

## 🚨 Common Mistakes to Avoid

### ❌ Wrong Port for Vercel
```
# DON'T USE port 5432 for Vercel:
DATABASE_URL=postgresql://...@db.xxx.co:5432/postgres
```

### ✅ Correct Port for Vercel
```
# DO USE port 6543 with pooling:
DATABASE_URL=postgresql://...@db.xxx.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### ❌ Wrong Port for Migration
```
# DON'T USE port 6543 for migrations:
$env:DATABASE_URL="postgresql://...@db.xxx.co:6543/postgres?pgbouncer=true"
npm run db:migrate
```

### ✅ Correct Port for Migration
```
# DO USE port 5432 for migrations:
$env:DATABASE_URL="postgresql://...@db.xxx.co:5432/postgres"
npm run db:migrate
```

## 📊 Supabase Dashboard Overview

```
Dashboard Navigation:
├─ Home
│  └─ Project overview, usage stats
├─ Table Editor ⭐ View your data
│  └─ Browse users, posts, refresh_tokens
├─ SQL Editor
│  └─ Run custom SQL queries
├─ Database
│  └─ Backups, extensions, replication
├─ Authentication
│  └─ (Not used - we use custom JWT)
├─ Storage
│  └─ (Not used currently)
└─ Settings ⭐ Get connection strings
   ├─ General - Project settings
   ├─ Database - Connection strings
   ├─ API - API keys (not needed)
   └─ Billing - Usage limits
```

## 🎓 Understanding Connection Limits

### Free Tier: 60 Concurrent Connections

**Without Pooling (Port 5432):**
```
Each Vercel function → New connection
10 concurrent users → 10+ connections
Heavy traffic → Quickly hit 60 limit ❌
```

**With Pooling (Port 6543):**
```
All functions → Share connection pool
PgBouncer manages connections
100+ concurrent users → ~15 connections ✅
```

## ⚡ Performance Tips

### 1. Use Connection Pooling
```
?pgbouncer=true&connection_limit=1
```

### 2. Set Timeouts
```
?pool_timeout=10&connect_timeout=10
```

### 3. Monitor Usage
- Check Supabase dashboard regularly
- Watch connection count
- Monitor database size (500 MB limit)

### 4. Optimize Queries
- Use indexes for frequently queried columns
- Avoid SELECT * in production
- Use LIMIT for large result sets

## 🆘 Emergency Troubleshooting

### Too Many Connections Error
```powershell
# Check current connections in Supabase SQL Editor:
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections:
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < current_timestamp - INTERVAL '5 minutes';
```

### Reset Everything
```powershell
# 1. Delete all tables in Supabase Table Editor
# 2. Run migration again:
cd backend
$env:DATABASE_URL="postgresql://...@db.xxx.co:5432/postgres"
npm run db:migrate

# 3. Redeploy backend on Vercel
# 4. Test
```

## 📞 Getting Help

1. **Supabase Issues:** https://github.com/supabase/supabase/discussions
2. **Vercel Issues:** https://github.com/vercel/vercel/discussions
3. **PostgreSQL Errors:** Check Supabase logs
4. **Connection Issues:** Verify both connection strings

## ✨ Success Indicators

You'll know it's working when:
- ✅ Migration creates all 3 tables in Supabase
- ✅ Backend health check returns `{"status":"ok"}`
- ✅ Frontend loads without errors
- ✅ User registration works
- ✅ Drafts save successfully
- ✅ Posts publish and display
- ✅ No connection errors in Vercel logs

---

**Quick Reference:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
