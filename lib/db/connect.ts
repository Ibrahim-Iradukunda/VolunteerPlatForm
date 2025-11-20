import { createClient, type Client } from "@libsql/client"

let db: Client | null = null
let schemaPromise: Promise<void> | null = null

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_PATH
  if (!url) {
    throw new Error("TURSO_DATABASE_URL (or DATABASE_PATH) is not configured")
  }

  const authToken = process.env.TURSO_AUTH_TOKEN

  return createClient({
    url,
    authToken,
  })
}

function getDB(): Client {
  if (!db) {
    db = createDbClient()
    schemaPromise = initializeSchema(db)
  }

  return db
}

async function initializeSchema(database: Client) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('volunteer', 'organization', 'admin')),
      disabilityStatus TEXT,
      skills TEXT,
      availability TEXT,
      accessibilityNeeds TEXT,
      orgName TEXT,
      contactInfo TEXT,
      description TEXT,
      verified INTEGER DEFAULT 0,
      rejected INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      organizationId TEXT NOT NULL,
      organizationName TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('onsite', 'remote', 'hybrid')),
      accessibilityFeatures TEXT DEFAULT '[]',
      skills TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      applications INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organizationId) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      opportunityId TEXT NOT NULL,
      volunteerId TEXT NOT NULL,
      volunteerName TEXT NOT NULL,
      content TEXT NOT NULL CHECK(length(content) <= 500),
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
      FOREIGN KEY (volunteerId) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
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
    )`,
    `CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      opportunityId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(opportunityId, userId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
    `CREATE INDEX IF NOT EXISTS idx_opportunities_organizationId ON opportunities(organizationId)`,
    `CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status)`,
    `CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type)`,
    `CREATE INDEX IF NOT EXISTS idx_comments_opportunityId ON comments(opportunityId)`,
    `CREATE INDEX IF NOT EXISTS idx_comments_volunteerId ON comments(volunteerId)`,
    `CREATE INDEX IF NOT EXISTS idx_applications_volunteerId ON applications(volunteerId)`,
    `CREATE INDEX IF NOT EXISTS idx_applications_opportunityId ON applications(opportunityId)`,
    `CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`,
    `CREATE INDEX IF NOT EXISTS idx_likes_opportunityId ON likes(opportunityId)`,
    `CREATE INDEX IF NOT EXISTS idx_likes_userId ON likes(userId)`
  ]

  for (const statement of statements) {
    await database.execute(statement)
  }

  try {
    await database.execute(`ALTER TABLE users ADD COLUMN rejected INTEGER DEFAULT 0`)
  } catch {
    // Column already exists
  }
}

async function connectDB() {
  const database = getDB()
  if (schemaPromise) {
    await schemaPromise
  }
  return database
}

export default connectDB
export { getDB }