import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

// Get database path
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "volunteer.db")

// Ensure data directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Global database instance
let db: Database.Database | null = null

function getDB(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL")
    db.pragma("foreign_keys = ON")
    initializeSchema(db)
  }
  return db
}

function initializeSchema(database: Database.Database) {
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('volunteer', 'organization', 'admin')),
      disabilityStatus TEXT,
      skills TEXT, -- JSON array
      availability TEXT,
      accessibilityNeeds TEXT, -- JSON array
      orgName TEXT,
      contactInfo TEXT,
      description TEXT,
      verified INTEGER DEFAULT 0,
      rejected INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  
  // Add rejected column if it doesn't exist (for existing databases)
  try {
    database.exec(`ALTER TABLE users ADD COLUMN rejected INTEGER DEFAULT 0`)
  } catch (e) {
    // Column already exists, ignore
  }

  // Opportunities table
  database.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      organizationId TEXT NOT NULL,
      organizationName TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL, -- JSON array
      location TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('onsite', 'remote', 'hybrid')),
      accessibilityFeatures TEXT DEFAULT '[]', -- JSON array
      skills TEXT DEFAULT '[]', -- JSON array
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      applications INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organizationId) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Comments table
  database.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      opportunityId TEXT NOT NULL,
      volunteerId TEXT NOT NULL,
      volunteerName TEXT NOT NULL,
      content TEXT NOT NULL CHECK(length(content) <= 500),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
      FOREIGN KEY (volunteerId) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Applications table
  database.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      volunteerId TEXT NOT NULL,
      volunteerName TEXT NOT NULL,
      opportunityId TEXT NOT NULL,
      opportunityTitle TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
      message TEXT DEFAULT '',
      appliedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (volunteerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
      UNIQUE(volunteerId, opportunityId)
    )
  `)

  // Likes table (many-to-many relationship)
  database.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      opportunityId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(opportunityId, userId)
    )
  `)

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_opportunities_organizationId ON opportunities(organizationId);
    CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
    CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
    CREATE INDEX IF NOT EXISTS idx_comments_opportunityId ON comments(opportunityId);
    CREATE INDEX IF NOT EXISTS idx_comments_volunteerId ON comments(volunteerId);
    CREATE INDEX IF NOT EXISTS idx_applications_volunteerId ON applications(volunteerId);
    CREATE INDEX IF NOT EXISTS idx_applications_opportunityId ON applications(opportunityId);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_likes_opportunityId ON likes(opportunityId);
    CREATE INDEX IF NOT EXISTS idx_likes_userId ON likes(userId);
  `)
}

// Connect function (for compatibility with existing code)
async function connectDB() {
  return getDB()
}

export default connectDB
export { getDB }
