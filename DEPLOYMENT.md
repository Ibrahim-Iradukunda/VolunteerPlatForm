# Deployment Guide

## ⚠️ CRITICAL: SQLite Cannot Work on Vercel

**SQLite does NOT work on Vercel's serverless platform** because:

1. **Native Bindings Issue**: `better-sqlite3` requires native C++ bindings that cannot be properly compiled/loaded on Vercel's serverless environment
2. **Filesystem Limitations**: Vercel uses a read-only filesystem (except `/tmp`)
3. **No Persistent Storage**: SQLite requires persistent file storage, which Vercel doesn't provide
4. **Ephemeral Data**: Even if it worked, data in `/tmp` would be lost on each serverless function invocation

### Current Error on Vercel:
```
Error: Could not locate the bindings file
```

This confirms that `better-sqlite3` cannot load its native module on Vercel.

## Deployment Options

### Option 1: Deploy to Render (Recommended for SQLite)

Render supports persistent disk storage, making it perfect for SQLite.

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Starter ($7/month) or higher

3. **Add Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   DATABASE_PATH=/opt/render/project/src/data/volunteer.db
   ```

4. **Add Persistent Disk** (if available):
   - Name: `volunteer-db`
   - Mount Path: `/opt/render/project/src/data`
   - Size: 1GB

5. **Deploy**

### Option 2: Deploy to Railway

Railway also supports persistent storage.

1. **Create a Railway account** at [railway.app](https://railway.app)
2. **Create a new project** from your GitHub repo
3. **Add environment variables** (same as Render)
4. **Deploy**

### Option 3: Migrate to PostgreSQL (For Vercel)

If you want to use Vercel, you need to migrate from SQLite to PostgreSQL:

1. **Use Vercel Postgres** or **Supabase** (free tier available)
2. **Update database connection** to use PostgreSQL
3. **Migrate schema** to PostgreSQL

## Current Vercel Deployment Status

The app is currently deployed on Vercel but **will not work** because:
- SQLite cannot create the database directory
- API routes return 500 errors
- Authentication will fail

## Quick Fix for Testing (Temporary)

The code has been updated to use `/tmp` on Vercel, but:
- ⚠️ Data will be lost on each serverless function invocation
- ⚠️ Not suitable for production
- ⚠️ Users will lose data constantly

## Recommended Solution

**Deploy to Render or Railway** to keep using SQLite, or **migrate to PostgreSQL** to use Vercel.

