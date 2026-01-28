/**
 * Script to test the DingTalk plugin with local Clawdbot
 * This script will:
 * 1. Validate the plugin structure
 * 2. Create a test configuration
 * 3. Provide instructions for testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing DingTalk Plugin (Stream Mode)\n');

// Check if the plugin built successfully
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ Dist directory does not exist. Please run `npm run build` first.');
  process.exit(1);
}

const indexJs = path.join(distDir, 'index.js');
if (!fs.existsSync(indexJs)) {
  console.error('❌ dist/index.js does not exist. Please run `npm run build` first.');
  process.exit(1);
}

console.log('✅ Plugin built successfully');

// Check if Clawdbot is available
try {
  execSync('which clawdbot', { stdio: 'pipe' });
  console.log('✅ Clawdbot/Moltbot is available');
} catch (error) {
  console.log('⚠️  Clawdbot/Moltbot not found, but you can still install manually');
}

// Create a sample configuration for testing
const testConfig = {
  channels: {
    dingtalk: {
      accounts: {
        local_test: {
          enabled: true,
          clientId: "YOUR_APP_KEY_HERE",
          clientSecret: "YOUR_APP_SECRET_HERE"
        }
      }
    }
  },
  plugins: {
    entries: {
      "dingtalk-channel": {
        path: path.resolve(__dirname, 'dist/index.js')
      }
    }
  }
};

const configPath = path.join(__dirname, 'local-test-config.json');
fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));
console.log(`✅ Created test configuration at ${configPath}`);

// Provide instructions
console.log('\n📋 Testing Instructions:\n');

console.log('1. Set up your DingTalk app:');
console.log('   - Go to https://open.dingtalk.com/');
console.log('   - Create an enterprise internal app');
console.log('   - Add Robot capability with Stream Mode enabled');
console.log('   - Get your AppKey (clientId) and AppSecret (clientSecret)\n');

console.log('2. Update the test config:');
console.log(`   - Edit ${configPath}`);
console.log('   - Replace YOUR_APP_KEY_HERE with your AppKey');
console.log('   - Replace YOUR_APP_SECRET_HERE with your AppSecret\n');

console.log('3. Build and test:');
console.log('   npm run build');
console.log(`   clawdbot --config ${configPath}\n`);

console.log('4. Test by sending a message to your robot in DingTalk.');
console.log('   For group chats, @mention the robot.\n');

console.log('💡 Tips:');
console.log('- No ngrok or public IP needed! Stream mode connects outbound.');
console.log('- Check Clawdbot logs at ~/.clawdbot/logs/ for debugging');
console.log('- Session webhooks for replies expire after ~2 hours');

console.log('\n🚀 You\'re ready to test your DingTalk Stream plugin!');