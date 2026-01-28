# Quick Start Guide

## 1. Clone and Build the Plugin

```bash
cd /root/clawd/dingtalk-channel-project
npm install
npm run build
```

## 2. Test with Your Local Clawdbot

```bash
clawdbot --config /root/clawd/dingtalk-channel-project/local-test-config.json
```

## 3. Simulate a DingTalk Message (for testing)

```bash
curl -X POST http://localhost:3001/dingtalk/callback \
  -H "Content-Type: application/json" \
  -H "timestamp: $(date +%s)000" \
  -d '{
    "conversationId":"test_convo",
    "senderStaffId":"test_user", 
    "senderNick":"Test User",
    "isAdmin":false,
    "text":{"content":"Hello Bot"},
    "msgtype":"text"
  }'
```

## 4. Configure Real DingTalk Robot

1. Create a custom robot in DingTalk
2. Get the webhook URL and security settings
3. Update your Clawdbot configuration:

```json
{
  "channels": {
    "dingtalk": {
      "accounts": {
        "my_robot": {
          "enabled": true,
          "webhook": {
            "port": 3000,
            "path": "/dingtalk/callback" 
          },
          "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=YOUR_ACTUAL_TOKEN",
          "secret": "YOUR_ACTUAL_SECRET",
          "token": "YOUR_VERIFY_TOKEN"
        }
      }
    }
  },
  "plugins": {
    "entries": {
      "dingtalk-channel": {
        "path": "/root/clawd/dingtalk-channel-project/dist/index.js"
      }
    }
  }
}
```

## 5. Restart Clawdbot

```bash
clawdbot gateway restart
```

Your DingTalk integration should now be live!