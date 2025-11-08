#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * This script checks if all required environment variables are set.
 * Run: node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const optionalVars = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'NODE_ENV',
  'SETUP_SECRET_TOKEN',
];

console.log('\n🔍 Checking Environment Variables\n');

let allGood = true;

// Check required variables
console.log('Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const masked = varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('URI')
      ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
      : value;
    console.log(`  ✅ ${varName}: ${masked}`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
    allGood = false;
  }
});

// Check optional variables
console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const masked = varName.includes('SECRET') || varName.includes('PASSWORD')
      ? `${value.substring(0, 5)}...`
      : value;
    console.log(`  ✓ ${varName}: ${masked}`);
  } else {
    console.log(`  ○ ${varName}: not set (optional)`);
  }
});

// Validation checks
console.log('\nValidation:');

const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
    console.log('  ✅ MONGODB_URI format looks correct');
  } else {
    console.log('  ⚠️  MONGODB_URI format might be incorrect');
  }
}

const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret) {
  if (jwtSecret.length >= 32) {
    console.log('  ✅ JWT_SECRET length is sufficient (>= 32 characters)');
  } else {
    console.log('  ⚠️  JWT_SECRET should be at least 32 characters for security');
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All required environment variables are set!');
  console.log('\nYou can now run:');
  console.log('  npm run dev        # Start development server');
  console.log('  npm run init-db    # Initialize database');
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('\nPlease:');
  console.log('  1. Create a .env.local file');
  console.log('  2. Copy env.template to .env.local');
  console.log('  3. Fill in the required values');
  console.log('  4. Or run: node scripts/setup-wizard.js');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);

