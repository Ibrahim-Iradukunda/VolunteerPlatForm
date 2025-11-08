# Deployment Guide

This guide will help you deploy the Volunteer Platform to Netlify with MongoDB Atlas as your cloud database.

## Prerequisites

- A GitHub account (for connecting to Netlify)
- A MongoDB Atlas account (free tier available)
- A Netlify account (free tier available)

## Step 1: Set Up MongoDB Atlas Database

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account (M0 Free Tier is sufficient for development)
3. Verify your email address

### 1.2 Create a Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (or higher for production)
3. Select a cloud provider and region (choose one closest to your users)
4. Click **"Create"** and wait for the cluster to be created (2-3 minutes)

### 1.3 Configure Database Access

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username and generate a secure password (save this!)
5. Set user privileges to **"Atlas Admin"** (or create a custom role with read/write access)
6. Click **"Add User"**

### 1.4 Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - **Note**: For production, restrict to specific IPs or Netlify's IP ranges
4. Click **"Confirm"**

### 1.5 Get Your Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name at the end: `...mongodb.net/volunteer-platform?retryWrites=true&w=majority`

**Your final connection string should look like:**

```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/volunteer-platform?retryWrites=true&w=majority
```

## Step 2: Set Up Netlify Deployment

### 2.1 Connect Your Repository

1. Go to [Netlify](https://www.netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Netlify will auto-detect Next.js settings

### 2.2 Configure Build Settings

Netlify should auto-detect these settings, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20` (set in Environment variables)

### 2.3 Set Environment Variables

1. In your Netlify site dashboard, go to **"Site settings"** → **"Environment variables"**
2. Add the following variables:

#### Required Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteer-platform?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-generate-a-strong-random-string
NODE_ENV=production
```

#### Optional but Recommended:

```
SETUP_SECRET_TOKEN=your-random-secret-for-setup-api-endpoints
```

**Note:** `SETUP_SECRET_TOKEN` protects the database initialization endpoints. Generate a random string and keep it secure.

#### Optional Variables (for email notifications):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@volunteerplatform.com
```

**Important Notes:**

- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (you can use: `openssl rand -base64 32` or any secure random string generator)
- For Gmail SMTP, you'll need to create an [App Password](https://support.google.com/accounts/answer/185833)

### 2.4 Deploy

1. Click **"Deploy site"** (or push to your main branch if auto-deploy is enabled)
2. Wait for the build to complete
3. Your site will be live at `https://your-site-name.netlify.app`

## Step 3: Initialize the Database

After deployment, you need to initialize the database with indexes and create an admin user.

### Option A: Using API Endpoints (Recommended - Easiest)

The app includes API endpoints for database initialization that you can call after deployment.

#### Initialize Database:

```bash
# Without authentication (if SETUP_SECRET_TOKEN is not set)
curl -X POST https://your-site.netlify.app/api/setup/init-db

# With authentication (if SETUP_SECRET_TOKEN is set)
curl -X POST https://your-site.netlify.app/api/setup/init-db \
  -H "Authorization: Bearer your-setup-secret-token"
```

#### Create Admin User:

```bash
# Without authentication
curl -X POST https://your-site.netlify.app/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securepassword","name":"Admin User"}'

# With authentication
curl -X POST https://your-site.netlify.app/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-setup-secret-token" \
  -d '{"email":"admin@example.com","password":"securepassword","name":"Admin User"}'
```

#### Using the Post-Deployment Script:

```bash
npm run post-deploy https://your-site.netlify.app your-setup-secret-token
```

This interactive script will guide you through both steps.

### Option B: Using Local Script (Development)

1. Clone your repository locally
2. Create a `.env.local` file with your MongoDB URI:
   ```
   MONGODB_URI=your-mongodb-connection-string
   ```
3. Run the initialization script:
   ```bash
   npm run init-db
   ```
4. Or create an admin user:
   ```bash
   npm run create-admin admin@example.com securepassword123 "Admin User"
   ```

### Option C: Using MongoDB Atlas UI

1. Go to MongoDB Atlas → **"Database"** → **"Browse Collections"**
2. The database will be created automatically when your app first connects
3. Create indexes manually through the Atlas UI if needed

**Note:** For security, set `SETUP_SECRET_TOKEN` in your Netlify environment variables to protect the setup endpoints.

## Step 4: Create Your First Admin User

You can create an admin user in several ways:

### Method 1: Using the Script (Local)

```bash
npm run create-admin admin@example.com yourpassword "Admin Name"
```

### Method 2: Using MongoDB Atlas UI

1. Go to MongoDB Atlas → **"Database"** → **"Browse Collections"**
2. Select your database → **"users"** collection
3. Click **"Insert Document"**
4. Add a document with:
   ```json
   {
     "email": "admin@example.com",
     "password": "$2a$10$hashedpassword...", // Use bcrypt to hash
     "name": "Admin User",
     "role": "admin",
     "createdAt": new Date(),
     "updatedAt": new Date()
   }
   ```
   **Note**: You'll need to hash the password using bcrypt. Use an online tool or the script.

### Method 3: Using the App (After First Admin is Created)

Once you have one admin, you can create more through the admin dashboard.

## Step 5: Verify Deployment

1. Visit your deployed site
2. Try logging in with your admin credentials
3. Check the admin dashboard
4. Test creating an opportunity
5. Test the volunteer registration flow

## Troubleshooting

### Build Fails with "MONGODB_URI not defined"

- Ensure environment variables are set in Netlify dashboard
- Check that variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Database Connection Errors

- Verify your MongoDB Atlas connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas Network Access
- Ensure database user has proper permissions
- Check MongoDB Atlas cluster is running (not paused)

### Admin User Creation Issues

- Ensure the email is unique
- Password must be at least 6 characters
- Check MongoDB connection is working

### Email Not Sending

- Verify SMTP credentials are correct
- For Gmail, use App Password (not regular password)
- Check SMTP settings in environment variables
- Emails will log to console if SMTP is not configured

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use strong JWT_SECRET** (at least 32 characters, random)
3. **Restrict MongoDB Network Access** to specific IPs in production
4. **Use MongoDB Atlas IP Whitelist** for production (not 0.0.0.0/0)
5. **Enable MongoDB Atlas Encryption** at rest
6. **Regularly rotate passwords** and secrets
7. **Use HTTPS** (Netlify provides this automatically)

## Monitoring

- **Netlify Analytics**: Monitor site performance and traffic
- **MongoDB Atlas Monitoring**: Check database performance and usage
- **Netlify Logs**: View build logs and function logs
- **Application Logs**: Check browser console and server logs

## Scaling

As your application grows:

1. **Upgrade MongoDB Atlas** tier if needed
2. **Enable MongoDB Atlas Auto-Scaling**
3. **Use Netlify Pro** for better performance
4. **Implement caching** for frequently accessed data
5. **Optimize database queries** and indexes

## Support

For issues:

- Check Netlify [Documentation](https://docs.netlify.com)
- Check MongoDB Atlas [Documentation](https://docs.atlas.mongodb.com)
- Review application logs in Netlify dashboard
