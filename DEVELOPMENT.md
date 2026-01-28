# Development Guide for Moltbot DingTalk Channel Plugin

This document provides detailed information about developing and testing the DingTalk channel plugin for Moltbot/Clawdbot.

## Architecture

The plugin uses **DingTalk Stream Mode** to receive messages via WebSocket, eliminating the need for public IPs, webhooks, or ngrok.

### Components

1. **Channel Component**: Handles outgoing messages (from Moltbot to DingTalk)
2. **Service Component**: Maintains WebSocket connection to receive incoming messages

### Stream Mode Benefits

- **Zero public IP**: No need to expose your server to the internet
- **Zero webhook setup**: Uses outbound WebSocket connection
- **Zero firewall config**: Only requires outbound network access
- **Zero ngrok/tunneling**: Works directly in local development

## Configuration

### Required Credentials

You'll need to obtain from [DingTalk Developer Console](https://open.dingtalk.com/):

- **ClientID (AppKey)**: Your application's client identifier
- **ClientSecret (AppSecret)**: Your application's secret key

### Configuration Example

```json
{
  "channels": {
    "dingtalk": {
      "accounts": {
        "default": {
          "enabled": true,
          "clientId": "YOUR_APP_KEY",
          "clientSecret": "YOUR_APP_SECRET",
          "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=..." 
        }
      }
    }
  }
}
```

> **Note**: `webhookUrl` is optional and only needed for proactive messages (not replies).

## DingTalk App Setup

### 1. Create Enterprise Internal App

1. Go to [DingTalk Developer Console](https://open.dingtalk.com/)
2. Create a new enterprise internal application
3. Note your ClientID (AppKey) and ClientSecret (AppSecret)

### 2. Enable Robot Capability

1. In your app settings, go to **Application Capabilities** → **Add Capability**
2. Select **Robot**
3. Fill in robot information
4. **Important**: Select **Stream Mode** (not HTTP mode)
5. Publish the robot

### 3. Configure Permissions

Ensure your app has the necessary permissions:
- Robot message sending/receiving permissions
- Any other permissions your bot requires

## Message Flow

### Incoming Messages (DingTalk → Moltbot)

1. DingTalk sends message via WebSocket (Stream mode)
2. Plugin receives message in callback handler
3. Plugin extracts sender info, conversation ID, and content
4. Plugin forwards to Moltbot via `api.postMessage`
5. Plugin acknowledges message to DingTalk

### Outgoing Messages (Moltbot → DingTalk)

1. Moltbot calls `sendText` with response
2. Plugin uses **session webhook** from incoming message (for replies)
3. Or uses configured `webhookUrl` (for proactive messages)
4. Returns success/error status

## Testing Locally

### Prerequisites

- Node.js 18+ installed
- DingTalk developer account with an internal app
- App configured with Stream mode robot

### Setup Steps

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Configure with your credentials
5. Run with Moltbot

### Testing Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
node test-plugin.js
```

## Troubleshooting

### Common Issues

1. **Connection fails**: Verify clientId and clientSecret are correct
2. **No messages received**: Check that Stream mode is enabled in DingTalk console
3. **Reply fails**: Ensure session webhook hasn't expired (valid for ~2 hours)

### Debug Logging

Enable verbose logging in Moltbot to see connection status and message flow:
- Check Moltbot logs at `~/.clawdbot/logs/`

## Migration from Webhook Mode

If upgrading from the previous webhook-based version:

1. Update your config to use `clientId`/`clientSecret` instead of `webhookUrl`/`secret`
2. Enable Stream mode in DingTalk developer console for your app
3. Remove any ngrok/webhook server setup
4. Rebuild and restart