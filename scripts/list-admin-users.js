/**
 * Script to list all admin users in SQLite database
 * Run with: node scripts/list-admin-users.js
 */

require('dotenv').config({ path: '.env.local' })
const Database = require('better-sqlite3')
const path = require('path')

// Get database path
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'volunteer.db')

try {
  // Connect to database
  const db = new Database(dbPath)
  
  // Find all admin users
  const adminUsers = db.prepare('SELECT id, email, name, role, verified, createdAt FROM users WHERE role = ?').all('admin')
  
  if (adminUsers.length === 0) {
    console.log('No admin users found in the database.')
    console.log('\nTo create an admin user, run:')
    console.log('  node scripts/create-admin.js <email> <password> <name>')
    console.log('\nOr visit: /create-admin')
  } else {
    console.log(`Found ${adminUsers.length} admin user(s):\n`)
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Verified: ${user.verified ? 'Yes' : 'No'}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log(`   ID: ${user.id}`)
      console.log('')
    })
    console.log('⚠️  Note: Passwords are hashed and cannot be retrieved.')
    console.log('   If you forgot the password, you need to create a new admin user.')
  }
  
  db.close()
  process.exit(0)
} catch (error) {
  console.error('Error accessing database:', error.message)
  process.exit(1)
}



