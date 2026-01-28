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

console.log('🧪 Testing DingTalk Plugin with Local Clawdbot\n');

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
  console.log('✅ Clawdbot is available');
} catch (error) {
  console.log('⚠️  Clawdbot not found, but that\'s OK - you can still install manually');
}

// Create a sample configuration for testing
const testConfig = {
  channels: {
    dingtalk: {
      accounts: {
        local_test: {
          enabled: true,
          webhook: {
            port: 3001,  // Using different port to avoid conflicts
            path: "/dingtalk/callback"
          },
          webhookUrl: "https://oapi.dingtalk.com/robot/send?access_token=TEST_TOKEN",
          secret: "TEST_SECRET",
          token: "TEST_TOKEN"
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

console.log('1. First, ensure your plugin is built:');
console.log('   cd /root/clawd/dingtalk-channel-project');
console.log('   npm run build\n');

console.log('2. To test with your local Clawdbot, you have two options:\n');

console.log('   Option A - Direct config modification:');
console.log('   - Copy the plugin path to your Clawdbot config (~/.clawdbot/clawdbot.json)');
console.log('   - Add the plugin entry and DingTalk channel config');
console.log('   - Restart Clawdbot\n');

console.log('   Option B - Temporary test (recommended):');
console.log('   - Run Clawdbot with custom config:');
console.log(`     clawdbot --config ${configPath}`);
console.log('   - Or run with the temporary config:\n');

console.log('3. To simulate a DingTalk webhook (for testing):');
console.log('   curl -X POST http://localhost:3001/dingtalk/callback \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"conversationId":"test_convo","senderStaffId":"test_user","senderNick":"Test User","isAdmin":false,"text":{"content":"Hello Bot"},"msgtype":"text"}\'\n');

console.log('4. Check Clawdbot logs for incoming messages and responses.\n');

console.log('💡 Pro Tips:');
console.log('- Use a service like ngrok to expose your local server to the internet for real DingTalk testing');
console.log('- Check the Clawdbot logs in ~/.clawdbot/logs/ for debugging');
console.log('- Remember to use real webhook URLs and secrets when testing with actual DingTalk');

console.log('\n🚀 You\'re ready to test your DingTalk plugin!');