/**
 * Script to update a user's name in the database
 * Run with: node scripts/update-user-name.js <email> <new-name>
 */

require('dotenv').config({ path: '.env.local' })
const Database = require('better-sqlite3')
const path = require('path')

// Get database path
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'volunteer.db')

function updateUserName() {
  try {
    const email = process.argv[2]
    const newName = process.argv[3]

    if (!email || !newName) {
      console.error('Error: Email and new name are required')
      console.error('Usage: node scripts/update-user-name.js <email> <new-name>')
      console.error('Example: node scripts/update-user-name.js admin@example.com "New Name"')
      process.exit(1)
    }

    // Connect to database
    const db = new Database(dbPath)
    
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim())
    
    if (!user) {
      console.error(`User with email ${email} not found in database.`)
      db.close()
      process.exit(1)
    }

    console.log(`Found user: ${user.email}`)
    console.log(`Current name: ${user.name}`)
    console.log(`Role: ${user.role}`)
    
    // Update name
    db.prepare('UPDATE users SET name = ?, updatedAt = ? WHERE email = ?').run(
      newName,
      new Date().toISOString(),
      email.toLowerCase().trim()
    )

    console.log(`\n✅ Name updated successfully!`)
    console.log(`Email: ${email}`)
    console.log(`New Name: ${newName}`)
    
    db.close()
    process.exit(0)
  } catch (error) {
    console.error('Error updating name:', error)
    process.exit(1)
  }
}

updateUserName()



