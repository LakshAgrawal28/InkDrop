# InkDrop Deployment with Supabase Database

## Complete Supabase Setup Guide for Vercel

---

## Step 1: Create Supabase Project

### 1.1: Sign Up and Create Project

1. Go to https://supabase.com
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (recommended for easy integration)
4. Create a new organization if you don't have one
5. Click **"New Project"**

### 1.2: Configure Project

- **Name:** `inkdrop-db` (or your preferred name)
- **Database Password:** Generate a strong password (SAVE THIS!)
- **Region:** Choose closest to your users
  - `us-east-1` - US East Coast
  - `us-west-1` - US West Coast
  - `eu-central-1` - Europe
  - `ap-southeast-1` - Asia Pacific
- **Pricing Plan:** Free (500 MB database, 2 GB bandwidth)

6. Click **"Create new project"**
7. Wait 2-3 minutes for database to provision

---

## Step 2: Get Database Connection Strings

### 2.1: Click the Connect Button

1. In your Supabase project dashboard
2. Look at the **top right corner** of the page
3. Click the **"Connect"** button (next to your project name)
4. A modal will open: "Connect to your project"

### 2.2: Get BOTH Connection Strings

You need to copy TWO different connection strings from this modal:

#### **Connection String #1: Direct Connection (Port 5432)**

**For:** Local development & Database migrations

**How to get it:**
1. In the Connect modal, look for the **"Method"** dropdown
2. Select **"Direct connection"**
3. Copy the connection string shown
4. It will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

#### **Connection String #2: Session Pooler (Port 6543)** ⭐

**For:** Vercel serverless backend (Production)

**How to get it:**
1. In the same Connect modal, change the **"Method"** dropdown
2. Select **"Session pooler"** or **"Transaction pooler"**
3. Copy the connection string shown
4. It will look like:
```
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 2.3: Replace the Password

**CRITICAL:** Both connection strings will have `[YOUR-PASSWORD]` as a placeholder.

**You must replace it with your actual database password:**
- This is the password you set when creating the Supabase project
- **Don't have it?** Go to Settings → Database → Click "Reset database password"

**Example:**
```
# Before (what you copy):
postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres

# After (what you use):
postgresql://postgres:MySecurePass123@db.abc123.supabase.co:5432/postgres
```

**Important Notes:**
- Port `5432` = Direct connection (use for local/migrations)
- Port `6543` = Connection pooling via PgBouncer (use for Vercel)
- Save both connection strings - you'll need them in the next steps

### 2.4: Which Connection String to Use?

| Task | Port | Connection Type |
|------|------|----------------|
| **Run database migration** | 5432 | Direct connection |
| **Local backend development** | 5432 | Direct connection |
| **Deploy to Vercel** | 6543 | Session pooler |
| **Production backend** | 6543 | Session pooler |

---

## Step 3: Configure Connection for Serverless

### Why Connection Pooling?

Vercel serverless functions create many database connections. Without pooling, you'll quickly hit Supabase's connection limit (free tier: 60 connections).

### Connection String Format

**For Vercel (Production):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

**For Local Development:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Additional Connection Parameters

You can add these to your connection string:

```
?pgbouncer=true&connection_limit=1&pool_timeout=10&connect_timeout=10
```

- `pgbouncer=true` - Enable connection pooling
- `connection_limit=1` - Limit connections per serverless function
- `pool_timeout=10` - Wait 10s for available connection
- `connect_timeout=10` - Connection timeout

---

## Step 4: Run Database Migration

### 4.1: Use the Direct Connection String (Port 5432)

```powershell
cd backend

# Set the DATABASE_URL with your Direct connection string (port 5432)
$env:DATABASE_URL="postgresql://postgres:YourPassword@db.xxxxx.supabase.co:5432/postgres"

# Run migration
npm run db:migrate
```

**Important:** Make sure you:
- Use port **5432** (not 6543)
- Replaced `[YOUR-PASSWORD]` with your actual password
- Are in the `backend` folder

You should see:
```
✓ Connected to database
✓ Created users table
✓ Created posts table
✓ Created refresh_tokens table
Migration completed successfully!
```

### 4.3: Verify in Supabase

1. Go to your Supabase dashboard
2. Click **"Table Editor"** in left sidebar
3. You should see three tables:
   - `users`
   - `posts`
   - `refresh_tokens`

---

## Step 5: Deploy Backend to Vercel

### 5.1: Add Environment Variables in Vercel

**In your Vercel backend project settings:**

1. Go to **Settings** → **Environment Variables**
2. Add each variable below:

```env
NODE_ENV=production
```

```env
DATABASE_URL=postgresql://postgres:YourPassword@aws-0-region.pooler.supabase.com:6543/postgres
```
**⚠️ Use your Session Pooler string (port 6543) - NOT the direct connection!**

```env
JWT_SECRET=<your-64-char-string>
JWT_REFRESH_SECRET=<your-64-char-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=https://your-frontend.vercel.app
```

**Generate secrets in PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

### 5.2: Deploy

```powershell
cd backend
vercel
```

Or use Vercel dashboard:
1. Import repository
2. Root directory: `backend`
3. Add environment variables
4. Deploy

---

## Step 6: Deploy Frontend to Vercel

### 6.1: Environment Variables

```env
VITE_API_URL=https://your-backend.vercel.app
```

### 6.2: Deploy

```powershell
cd frontend
vercel
```

---

## Step 7: Supabase Security Best Practices

### 7.1: Enable Row Level Security (RLS)

Supabase has RLS enabled by default, but since we're using direct PostgreSQL connections, we handle auth in our Express backend. No additional RLS setup needed.

### 7.2: Database Settings

1. Go to **Settings** → **Database**
2. Check these settings:

**Connection Pooling:**
- Mode: `Transaction` ✅ (default for serverless)
- Pool Size: 15 (free tier)

**SSL Mode:**
- Enabled ✅ (required for production)

### 7.3: Network Restrictions (Optional)

For additional security:
1. **Settings** → **Database** → **Network Restrictions**
2. Add Vercel's IP ranges (if needed)
3. Note: May cause cold start issues

---

## Step 8: Monitor Database Usage

### 8.1: Database Dashboard

1. Go to **Home** in Supabase dashboard
2. Monitor:
   - **Database Size:** Free tier = 500 MB
   - **Active Connections:** Free tier = 60 max
   - **Bandwidth:** 2 GB/month free

### 8.2: Table Editor

1. Click **"Table Editor"**
2. View/edit data directly
3. Run SQL queries in SQL Editor

### 8.3: Logs

1. Click **"Logs"** in sidebar
2. View:
   - Postgres logs
   - Connection errors
   - Slow queries

---

## Troubleshooting

### Error: "remaining connection slots reserved"

**Problem:** Too many connections open

**Solution:**
```env
# Use pooling connection (port 6543)
DATABASE_URL=postgresql://postgres:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### Error: "password authentication failed"

**Problem:** Wrong password in connection string

**Solution:**
1. Go to Supabase **Settings** → **Database**
2. Reset password if needed
3. Update `DATABASE_URL` in Vercel
4. Redeploy

### Error: "no pg_hba.conf entry"

**Problem:** SSL required but not specified

**Solution:** Add to connection string:
```
?sslmode=require
```

### Error: "prepared statement already exists"

**Problem:** Using session mode with serverless

**Solution:** Use transaction mode (port 6543):
```
?pgbouncer=true
```

### Migration Fails

**Problem:** Using pooling connection for migration

**Solution:** Use direct connection (port 5432) for migrations:
```powershell
$env:DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"
npm run db:migrate
```

---

## Supabase vs Other Providers

| Feature | Supabase | Neon | Railway |
|---------|----------|------|---------|
| Free Storage | 500 MB | 512 MB | 1 GB |
| Connection Limit | 60 | 100 | 100 |
| Bandwidth | 2 GB/mo | Unlimited | 100 GB |
| Connection Pooling | Built-in ✅ | Built-in ✅ | Manual |
| Admin Dashboard | Excellent ✅ | Basic | Good |
| Additional Features | Auth, Storage, Functions | Auto-suspend | Docker support |
| Cold Starts | No | Yes (after 5min) | No |

---

## Supabase Free Tier Limits

- **Database:** 500 MB
- **Bandwidth:** 2 GB/month
- **File Storage:** 1 GB
- **Realtime:** 200 concurrent connections
- **Edge Functions:** 500K invocations/month
- **No credit card required**

---

## Advanced: Using Supabase Auth (Optional)

If you want to migrate from custom JWT to Supabase Auth later:

1. **Enable Supabase Auth:**
   - Settings → Authentication → Enable email auth

2. **Install Supabase Client:**
   ```powershell
   npm install @supabase/supabase-js
   ```

3. **Replace custom auth** with Supabase SDK

This is optional and requires significant refactoring. Current JWT implementation works perfectly fine!

---

## Connection String Examples

### Production (Vercel Backend)
```env
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.abcdefghijk.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### Local Development
```env
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.abcdefghijk.supabase.co:5432/postgres
```

### With All Parameters
```env
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.abcdefghijk.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10&connect_timeout=10&sslmode=require
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│ SUPABASE CONNECTION QUICK REFERENCE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Dashboard:    https://supabase.com/dashboard           │
│ Settings:     Click gear icon → Database               │
│                                                         │
│ VERCEL (Serverless):                                    │
│   Port: 6543                                            │
│   Add: ?pgbouncer=true&connection_limit=1               │
│                                                         │
│ LOCAL / MIGRATIONS:                                     │
│   Port: 5432                                            │
│   Direct connection                                     │
│                                                         │
│ Free Tier:                                              │
│   - 500 MB database                                     │
│   - 60 max connections                                  │
│   - 2 GB bandwidth/month                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Get connection strings (port 6543 for Vercel)
3. ✅ Run migration with port 5432
4. ✅ Deploy backend with pooling connection
5. ✅ Deploy frontend
6. ✅ Test full application
7. 📊 Monitor usage in Supabase dashboard

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool
- **Supabase Discord:** https://discord.supabase.com
- **Status Page:** https://status.supabase.com

---

**Ready to deploy?** Follow [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) with these Supabase connection strings!
