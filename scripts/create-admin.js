/**
 * Script to create an admin user in the remote SQLite (Turso/libSQL) database.
 * Usage: node scripts/create-admin.js <email> <password> <name>
 */

require("dotenv").config({ path: ".env.local" })
const { createClient } = require("@libsql/client")
const bcrypt = require("bcryptjs")
const { randomUUID } = require("crypto")

function getClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_PATH
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL. Please set the environment variable and retry.")
    process.exit(1)
  }

  return createClient({
    url,
    authToken,
  })
}

async function initializeSchema(client) {
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
  ]

  for (const statement of statements) {
    await client.execute(statement)
  }
}

async function createAdmin() {
  const client = getClient()

  try {
    await initializeSchema(client)

    const email = process.argv[2]
    const password = process.argv[3]
    const name = process.argv[4]

    if (!email || !password || !name) {
      console.error("Error: All parameters are required")
      console.error("Usage: node scripts/create-admin.js <email> <password> <name>")
      process.exit(1)
    }

    console.log("Connecting to SQLite database...")
    console.log(`Database URL: ${process.env.TURSO_DATABASE_URL || process.env.DATABASE_PATH}`)

    const existingAdmin = await client.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email.toLowerCase().trim()],
    })

    if (existingAdmin.rows.length > 0) {
      console.log(`Admin user with email ${email} already exists`)
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const id = randomUUID()
    const now = new Date().toISOString()

    await client.execute({
      sql: `
        INSERT INTO users (id, email, password, name, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [id, email.toLowerCase().trim(), hashedPassword, name, "admin", now, now],
    })

    console.log("Admin user created successfully!")
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Name: ${name}`)
    console.log("\n⚠️  Please change the password after first login!")
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdmin().catch(error => {
  console.error("Unexpected error:", error)
  process.exit(1)
})
