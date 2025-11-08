/**
 * Script to create an admin user in MongoDB
 * Run with: node scripts/create-admin.js
 * 
 * Make sure MongoDB is running and MONGODB_URI is set in .env.local
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['volunteer', 'organization', 'admin'], required: true },
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI
    
    if (!mongoUri) {
      console.error('Error: MONGODB_URI environment variable is required')
      console.error('Please set MONGODB_URI in .env.local file')
      process.exit(1)
    }
    
    const email = process.argv[2]
    const password = process.argv[3]
    const name = process.argv[4]

    if (!email || !password || !name) {
      console.error('Error: All parameters are required')
      console.error('Usage: node scripts/create-admin.js <email> <password> <name>')
      console.error('Example: node scripts/create-admin.js admin@yourapp.com securepassword123 "Admin User"')
      process.exit(1)
    }
    
    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email })
    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists`)
      await mongoose.connection.close()
      return
    }

    // Create admin user
    const admin = new User({
      email,
      password, // Will be hashed by pre-save hook
      name,
      role: 'admin',
    })

    await admin.save()
    console.log(`Admin user created successfully!`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Name: ${name}`)
    console.log(`\n⚠️  Please change the password after first login!`)

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

createAdmin()

