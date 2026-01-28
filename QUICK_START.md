# Quick Start

## Prerequisites

- Node.js 18+
- A DingTalk developer account

## Setup

### 1. Create DingTalk App

1. Go to [DingTalk Developer Console](https://open.dingtalk.com/)
2. Create an enterprise internal application
3. Add **Robot** capability
4. Select **Stream Mode**
5. Publish the app

### 2. Get Credentials

From your app settings, copy:
- **AppKey** → Use as `clientId`
- **AppSecret** → Use as `clientSecret`

### 3. Configure Moltbot

Add to your moltbot config:

```json
{
  "channels": {
    "dingtalk": {
      "accounts": {
        "default": {
          "enabled": true,
          "clientId": "your-app-key",
          "clientSecret": "your-app-secret"
        }
      }
    }
  }
}
```

### 4. Install & Run

```bash
npm install
npm run build
```

Then start Moltbot - the plugin will automatically connect to DingTalk via Stream.

## Testing

Send a message to your robot in DingTalk. For group chats, @mention the robot.