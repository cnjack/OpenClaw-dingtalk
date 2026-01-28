/**
 * Simple test script to validate the plugin structure
 */

const fs = require('fs');
const path = require('path');

// Check if necessary files exist
const requiredFiles = [
  'package.json',
  'moltbot.plugin.json',
  'tsconfig.json',
  'src/index.ts',
];

console.log('🔍 Validating plugin structure...\n');

let allGood = true;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
}

// Check if src directory exists and has content
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  const srcFiles = fs.readdirSync(srcDir);
  console.log(`\n📁 Source files: ${srcFiles.length} files`);
  srcFiles.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('\n❌ src directory missing');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 Plugin structure looks good!');
  console.log('\nNext steps:');
  console.log('1. Run `npm install` to install dependencies');
  console.log('2. Run `npm run build` to compile TypeScript');
  console.log('3. Test the plugin with your local Clawdbot');
} else {
  console.log('❌ Some files are missing. Please check the structure.');
}