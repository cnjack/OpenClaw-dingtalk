# GitHub Repository Setup

Follow these steps to create and publish your open-source DingTalk channel plugin.

## 1. Initialize Git Repository

```bash
cd /root/clawd/dingtalk-channel-project
git init
git add .
git commit -m "Initial commit: DingTalk channel plugin for Moltbot"
```

## 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `moltbot-dingtalk-channel` or similar
3. Do not initialize with README, .gitignore, or license (we'll add those locally)

## 3. Link and Push

```bash
git remote add origin https://github.com/YOUR_USERNAME/moltbot-dingtalk-channel.git
git branch -M main
git push -u origin main
```

## 4. Add Additional Files

Create these additional files for a proper open-source project:

### License File

```bash
curl -O https://raw.githubusercontent.com/licenses/license-templates/master/LICENSE.MIT
```

Or create `LICENSE` file with MIT License content:

```
MIT License

Copyright (c) 2024 YOUR NAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Update README with Installation Instructions

```bash
cat > README.md << 'EOF'
# Moltbot DingTalk Channel Plugin

A custom channel plugin for Moltbot/Clawdbot to integrate with DingTalk (钉钉) custom robots.

## Overview

This plugin allows Moltbot/Clawdbot to connect with DingTalk through custom robot webhooks, enabling AI-powered interactions in both group chats and direct messages.

## Features

- Receive messages from DingTalk groups and direct chats
- Send responses back to DingTalk
- Support for webhook security (signature verification)
- Configurable multi-account support
- Text message handling

## Installation

```bash
# Install the plugin from npm
npm install -g @moltbot/dingtalk-channel

# Or install from GitHub
moltbot plugins install github:YOUR_USERNAME/moltbot-dingtalk-channel
```

## Configuration

Example configuration in `~/.clawdbot/moltbot.json`:

```json
{
  "channels": {
    "dingtalk": {
      "accounts": {
        "default": {
          "enabled": true,
          "webhook": {
            "port": 3000,
            "path": "/dingtalk/callback"
          },
          "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=YOUR_ACCESS_TOKEN",
          "secret": "YOUR_SIGNING_SECRET",
          "token": "YOUR_VERIFY_TOKEN"
        }
      }
    }
  }
}
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. For development: `npm run dev` (watches for changes)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
EOF
```

## 5. Publish to npm (Optional)

If you want to publish to npm for easier installation:

```bash
# Login to npm
npm login

# Publish the package
npm publish
```

## 6. Set up GitHub Actions (Optional)

Create `.github/workflows/test.yml` for automated testing:

```yaml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm install
    - run: npm run build
    - run: npm test # if you have tests
```

## 7. Add Badges to README

Add these badges to your README.md:

```markdown
![npm version](https://img.shields.io/npm/v/@moltbot/dingtalk-channel.svg)
![License](https://img.shields.io/npm/l/@moltbot/dingtalk-channel.svg)
![Downloads](https://img.shields.io/npm/dm/@moltbot/dingtalk-channel.svg)
```

## 8. Finalize Repository

Add the new files and commit:

```bash
git add .
git commit -m "Add LICENSE, updated README, and GitHub setup"
git push origin main
```

Your open-source DingTalk channel plugin is now ready for the world!