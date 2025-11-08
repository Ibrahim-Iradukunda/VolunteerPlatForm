# Inclusive Volunteer Opportunities Finder

A web application connecting youth and people with disabilities to meaningful volunteer opportunities across Africa. This platform enables volunteers to discover opportunities, organizations to post and manage opportunities, and administrators to oversee the platform.

## Features

- **Volunteer Features**
  - Browse and search volunteer opportunities
  - Filter opportunities by type, location, and accessibility needs
  - Apply to volunteer opportunities
  - View and manage applications
  - Like and comment on opportunities

- **Organization Features**
  - Create and manage volunteer opportunities
  - View and manage applications from volunteers
  - Organization dashboard

- **Admin Features**
  - Manage users, organizations, and opportunities
  - Verify organizations
  - Approve/reject opportunities and applications
  - Admin dashboard

## Tech Stack

- **Framework**: Next.js + (React)
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT-based authentication with bcryptjs
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Analytics**: Vercel Analytics

## Prerequisites

## Installation

1. **Clone the repository** (`https://github.com/Ibrahim-Iradukunda/VolunteerPlatForm.git`):

   ```bash
   cd "VolunteerPlatForm"
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   or if using pnpm:

   ```bash
   pnpm install
   ```

## Running the Project

### Development Mode

1. **Start the development server**:

   ```bash
   npm run dev
   ```

   or

   ```bash
   pnpm dev
   ```

2. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

   The application will automatically reload when you make changes to the code.

### Production Build

1. **Build the application**:

   ```bash
   npm run build
   ```

   or

   ```bash
   pnpm build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```
   or
   ```bash
   pnpm start
   ```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages (admin, organization, volunteer)
│   ├── opportunities/     # Opportunity pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── db/               # Database connection
│   ├── models/           # Mongoose models
│   └── utils/            # Utility functions
├── scripts/              # Utility scripts
│   └── create-admin.js   # Admin user creation script
└── public/               # Static assets
```

## The platform supports three user roles:

1. **Volunteer** - Can browse, search, and apply to opportunities
2. **Organization** - Can create and manage opportunities, view applications
3. **Admin** - Full platform access and management capabilities

## Environment Setup

1. **Create a `.env.local` file** in the root directory:

   ```env
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret-key
   NODE_ENV=development
   ```

2. **Get MongoDB URI**:
   - For local development: Use `mongodb://localhost:27017/volunteer-platform`
   - For production: Use MongoDB Atlas (see [DEPLOYMENT.md](./DEPLOYMENT.md))

3. **Generate JWT Secret**:
   - Use a strong random string (at least 32 characters)
   - You can generate one using: `openssl rand -base64 32`

## Database Setup

### Initialize Database (Creates indexes)

```bash
npm run init-db
```

### Create Admin User

```bash
npm run create-admin <email> <password> <name>
```

Example:
```bash
npm run create-admin admin@example.com securepassword123 "Admin User"
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deploy to Netlify:

1. **Run the setup wizard** (optional but recommended):
   ```bash
   npm run setup
   ```

2. Set up MongoDB Atlas (free tier available)

3. Connect your GitHub repository to Netlify

4. Add environment variables in Netlify dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `SETUP_SECRET_TOKEN` (optional, for securing setup endpoints)

5. Deploy!

6. **Initialize database after deployment:**
   ```bash
   npm run post-deploy https://your-site.netlify.app your-secret-token
   ```
   Or use the API endpoints directly (see [DEPLOYMENT.md](./DEPLOYMENT.md))

The `netlify.toml` file is already configured for Next.js deployment.

### Available Scripts:

- `npm run setup` - Interactive setup wizard
- `npm run check-env` - Check environment variables
- `npm run init-db` - Initialize database with indexes
- `npm run create-admin` - Create admin user
- `npm run post-deploy` - Post-deployment setup script
