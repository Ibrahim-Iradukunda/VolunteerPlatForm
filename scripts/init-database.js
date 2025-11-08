/**
 * Database Initialization Script
 * 
 * This script initializes the database with:
 * - Creates indexes for better query performance
 * - Sets up text search indexes
 * - Can create an initial admin user if needed
 * 
 * Usage:
 *   node scripts/init-database.js [admin-email] [admin-password] [admin-name]
 * 
 * Example:
 *   node scripts/init-database.js admin@example.com securepassword123 "Admin User"
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["volunteer", "organization", "admin"],
    required: true,
  },
  disabilityStatus: String,
  skills: [String],
  availability: String,
  accessibilityNeeds: [String],
  orgName: String,
  contactInfo: String,
  description: String,
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const OpportunitySchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["onsite", "remote", "hybrid"],
    required: true,
  },
  accessibilityFeatures: {
    type: [String],
    default: [],
  },
  skills: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  applications: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
}, {
  timestamps: true,
});

const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

const ApplicationSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  volunteerName: {
    type: String,
    required: true,
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Opportunity",
    required: true,
  },
  opportunityTitle: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  message: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

const CommentSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Opportunity",
    required: true,
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  volunteerName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

async function initializeDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI environment variable is required');
      console.error('Please set MONGODB_URI in .env.local file or as an environment variable');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    console.log('📊 Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('  ✓ User email index created');
    
    // Opportunity indexes
    await Opportunity.collection.createIndex({ title: "text", description: "text", location: "text" });
    await Opportunity.collection.createIndex({ organizationId: 1 });
    await Opportunity.collection.createIndex({ status: 1 });
    await Opportunity.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Opportunity indexes created');
    
    // Application indexes
    await Application.collection.createIndex({ volunteerId: 1, opportunityId: 1 }, { unique: true });
    await Application.collection.createIndex({ opportunityId: 1 });
    await Application.collection.createIndex({ volunteerId: 1 });
    await Application.collection.createIndex({ status: 1 });
    console.log('  ✓ Application indexes created');
    
    // Comment indexes
    await Comment.collection.createIndex({ opportunityId: 1 });
    await Comment.collection.createIndex({ volunteerId: 1 });
    await Comment.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Comment indexes created');
    
    console.log('✅ All indexes created successfully');
    
    // Create admin user if provided
    const adminEmail = process.argv[2];
    const adminPassword = process.argv[3];
    const adminName = process.argv[4];
    
    if (adminEmail && adminPassword && adminName) {
      console.log('\n👤 Creating admin user...');
      
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (existingAdmin) {
        console.log(`⚠️  Admin user with email ${adminEmail} already exists`);
      } else {
        const admin = new User({
          email: adminEmail,
          password: adminPassword, // Will be hashed by pre-save hook
          name: adminName,
          role: 'admin',
        });
        
        await admin.save();
        console.log(`✅ Admin user created successfully!`);
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Name: ${adminName}`);
        console.log(`\n⚠️  Please change the password after first login!`);
      }
    } else {
      console.log('\n💡 Tip: To create an admin user, run:');
      console.log('   node scripts/init-database.js <email> <password> <name>');
    }
    
    console.log('\n✅ Database initialization complete!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

initializeDatabase();

