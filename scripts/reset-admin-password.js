/**
 * Script to reset password for an existing admin user
 * Run with: node scripts/reset-admin-password.js <email> <new-password>
 */

require('dotenv').config({ path: '.env.local' })
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

// Get database path
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'volunteer.db')

async function resetPassword() {
  try {
    const email = process.argv[2]
    const newPassword = process.argv[3]

    if (!email || !newPassword) {
      console.error('Error: Email and new password are required')
      console.error('Usage: node scripts/reset-admin-password.js <email> <new-password>')
      console.error('Example: node scripts/reset-admin-password.js admin@example.com newpassword123')
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
    console.log(`Current role: ${user.role}`)
    console.log(`Name: ${user.name}`)
    
    // Update role to admin if not already
    if (user.role !== 'admin') {
      console.log(`\n⚠️  User is not an admin. Updating role to admin...`)
      db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', email.toLowerCase().trim())
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE email = ?').run(
      hashedPassword,
      new Date().toISOString(),
      email.toLowerCase().trim()
    )

    console.log(`\n✅ Password reset successfully!`)
    console.log(`Email: ${email}`)
    console.log(`New Password: ${newPassword}`)
    console.log(`\nYou can now log in with these credentials.`)
    
    db.close()
    process.exit(0)
  } catch (error) {
    console.error('Error resetting password:', error)
    process.exit(1)
  }
}

resetPassword()



