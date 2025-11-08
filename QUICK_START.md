# Quick Start Guide

Get your Volunteer Platform up and running in minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a free cluster (M0)
4. Create a database user
5. Whitelist IP: `0.0.0.0/0` (for development)
6. Get connection string: Click "Connect" → "Connect your application"
7. Copy the connection string

### 3. Create Environment File

Create `.env.local` in the root directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteer-platform?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here-minimum-32-characters
NODE_ENV=development
```

**Generate JWT_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 4. Initialize Database

```bash
npm run init-db
```

This creates all necessary database indexes.

### 5. Create Admin User

```bash
npm run create-admin admin@example.com yourpassword "Admin Name"
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 📦 Deploy to Netlify

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### Step 2: Connect to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repository
4. Netlify will auto-detect Next.js settings

### Step 3: Add Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=production
SETUP_SECRET_TOKEN=your-random-secret-token (optional but recommended)
```

**Note:** `SETUP_SECRET_TOKEN` protects the database setup endpoints. Generate a random string.

### Step 4: Deploy

Click "Deploy site" and wait for build to complete!

### Step 5: Initialize Production Database

After first deployment, you have three options:

#### Option A: Using API Endpoints (Easiest)

```bash
# Initialize database
curl -X POST https://your-site.netlify.app/api/setup/init-db

# Create admin user
curl -X POST https://your-site.netlify.app/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securepassword","name":"Admin User"}'
```

#### Option B: Using Post-Deployment Script

```bash
npm run post-deploy https://your-site.netlify.app your-setup-secret-token
```

#### Option C: Using Local Script

```bash
# Set MONGODB_URI to your production connection string in .env.local
npm run init-db admin@yourdomain.com password "Admin Name"
```

## ✅ Verify Everything Works

1. ✅ Visit your site
2. ✅ Login with admin credentials
3. ✅ Create a test opportunity
4. ✅ Register as a volunteer
5. ✅ Apply to an opportunity

## 🆘 Troubleshooting

**Build fails?**
- Check environment variables are set in Netlify
- Verify MongoDB connection string is correct

**Can't connect to database?**
- Check MongoDB Atlas IP whitelist
- Verify username/password in connection string
- Ensure cluster is running (not paused)

**Admin login doesn't work?**
- Verify admin user was created
- Check password is correct
- Ensure JWT_SECRET is set

## 📚 Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide
- Read [README.md](./README.md) for full documentation
- Customize your platform!

