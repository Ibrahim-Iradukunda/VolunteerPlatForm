/**
 * Script to create an admin user in SQLite
 * Run with: node scripts/create-admin.js
 * 
 * The database will be created automatically in the data/ directory
 */

require('dotenv').config({ path: '.env.local' })
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')
const { randomUUID } = require('crypto')

// Get database path
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'volunteer.db')

// Ensure data directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Initialize database connection
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Initialize schema if needed
function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
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
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

async function createAdmin() {
  try {
    initializeSchema()
    
    const email = process.argv[2]
    const password = process.argv[3]
    const name = process.argv[4]

    if (!email || !password || !name) {
      console.error('Error: All parameters are required')
      console.error('Usage: node scripts/create-admin.js <email> <password> <name>')
      console.error('Example: node scripts/create-admin.js <email> <password> <name>')
      db.close()
      process.exit(1)
    }
    
    console.log('Connecting to SQLite database...')
    console.log(`Database path: ${dbPath}`)

    // Check if admin already exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim())
    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists`)
      db.close()
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create admin user
    const id = randomUUID()
    const now = new Date().toISOString()
    
    db.prepare(`
      INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, email.toLowerCase().trim(), hashedPassword, name, 'admin', now, now)

    console.log(`Admin user created successfully!`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Name: ${name}`)
    console.log(`\n⚠️  Please change the password after first login!`)

    db.close()
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    db.close()
    process.exit(1)
  }
}

createAdmin()
