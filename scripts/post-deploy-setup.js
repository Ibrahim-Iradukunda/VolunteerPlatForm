#!/usr/bin/env node

/**
 * Post-Deployment Setup Script
 * 
 * This script helps you initialize your database after deploying to Netlify.
 * 
 * Usage:
 *   node scripts/post-deploy-setup.js <your-netlify-url> [setup-secret-token]
 * 
 * Example:
 *   node scripts/post-deploy-setup.js https://your-app.netlify.app your-secret-token
 */

const https = require('https');
const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function initializeDatabase(baseUrl, secretToken) {
  console.log('\n📊 Initializing database...');
  
  const url = `${baseUrl}/api/setup/init-db`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (secretToken) {
    headers['Authorization'] = `Bearer ${secretToken}`;
  }

  try {
    const response = await makeRequest(url, {
      method: 'POST',
      headers,
    });

    if (response.status === 200) {
      console.log('✅ Database initialized successfully');
      console.log(JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.error('❌ Failed to initialize database');
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function createAdminUser(baseUrl, secretToken) {
  console.log('\n👤 Creating admin user...');
  
  const email = await question('Admin Email: ');
  const password = await question('Admin Password: ');
  const name = await question('Admin Name: ');

  if (!email || !password || !name) {
    console.log('❌ All fields are required');
    return false;
  }

  const url = `${baseUrl}/api/setup/create-admin`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (secretToken) {
    headers['Authorization'] = `Bearer ${secretToken}`;
  }

  try {
    const response = await makeRequest(url, {
      method: 'POST',
      headers,
      body: { email, password, name },
    });

    if (response.status === 201) {
      console.log('✅ Admin user created successfully');
      console.log(JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.error('❌ Failed to create admin user');
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0];
  const secretToken = args[1];

  if (!baseUrl) {
    console.log('Usage: node scripts/post-deploy-setup.js <netlify-url> [setup-secret-token]');
    console.log('Example: node scripts/post-deploy-setup.js https://your-app.netlify.app your-secret-token');
    process.exit(1);
  }

  console.log('\n🚀 Post-Deployment Setup');
  console.log(`Target URL: ${baseUrl}\n`);

  // Initialize database
  const dbInit = await initializeDatabase(baseUrl, secretToken);
  if (!dbInit) {
    console.log('\n⚠️  Database initialization failed. Continuing anyway...');
  }

  // Create admin user
  const createAdmin = await question('\nCreate admin user? (y/N): ');
  if (createAdmin.toLowerCase() === 'y') {
    await createAdminUser(baseUrl, secretToken);
  }

  console.log('\n✅ Post-deployment setup complete!');
  console.log('\nNext steps:');
  console.log('1. Visit your site and login with admin credentials');
  console.log('2. Verify everything is working');
  console.log('3. Update environment variables in Netlify if needed\n');

  rl.close();
}

main().catch(console.error);

