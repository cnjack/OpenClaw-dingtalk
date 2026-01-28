# Development Guide for Moltbot DingTalk Channel Plugin

This document provides detailed information about developing and testing the DingTalk channel plugin for Moltbot/Clawdbot.

## Architecture

The plugin consists of two main components:

1. **Channel Component**: Handles outgoing messages (from Moltbot to DingTalk)
2. **Gateway Component**: Handles incoming messages (from DingTalk to Moltbot)

### Channel Component

The channel component implements the following interface:

- `id`: Unique identifier for the channel ("dingtalk")
- `meta`: Metadata displayed in UI
- `capabilities`: Defines what the channel supports
- `config`: Functions to manage account configurations
- `outbound`: Functions to send messages out

### Gateway Component

The gateway component handles the HTTP server that receives webhook callbacks from DingTalk:

- Starts an Express server to listen for incoming messages
- Validates security signatures and tokens
- Parses incoming messages and forwards them to Moltbot
- Manages server lifecycle

## Security Features

### Signature Verification

The plugin supports DingTalk's signature verification mechanism:
- Verifies the `timestamp` and `sign` headers against the configured secret
- Rejects unauthorized requests

### Token Verification

Optionally verifies the configured token against header/query parameters

## Message Processing Flow

### Incoming Messages (DingTalk → Moltbot)

1. DingTalk sends a webhook request to the configured endpoint
2. Plugin validates security credentials (signature/token)
3. Plugin parses the message body to extract:
   - Conversation ID (for thread identification)
   - Sender ID (for user identification)
   - Message content (text content)
4. Plugin cleans the message (removes @mentions)
5. Plugin forwards the message to Moltbot via `api.postMessage`
6. Plugin responds to DingTalk with success confirmation

### Outgoing Messages (Moltbot → DingTalk)

1. Moltbot calls the `sendText` function with message content
2. Plugin retrieves account configuration (webhook URL, secret)
3. If secret is configured, adds signature parameters to URL
4. Sends HTTP POST request to DingTalk webhook endpoint
5. Returns success/error status

## Testing Locally

### Prerequisites

- Node.js 18+ installed
- A running instance of Moltbot/Clawdbot
- A test DingTalk robot (for integration testing)

### Setup Steps

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Configure your Moltbot instance to use this plugin
5. Start your Moltbot instance

### Configuration Example

```json
{
  "channels": {
    "dingtalk": {
      "accounts": {
        "test": {
          "enabled": true,
          "webhook": {
            "port": 3000,
            "path": "/dingtalk/callback"
          },
          "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN",
          "secret": "YOUR_SIGNING_SECRET",
          "token": "YOUR_VERIFICATION_TOKEN"
        }
      }
    }
  },
  "plugins": {
    "entries": {
      "dingtalk-channel": {
        "path": "/path/to/this/plugin/dist/index.js"
      }
    }
  }
}
```

## Deployment Considerations

### Public Access

Since DingTalk needs to send HTTP requests to your server, ensure:
- Your server is accessible from the internet
- The configured port is open and not blocked by firewall
- Use HTTPS in production for security

### Security

- Always configure and use the signing secret
- Rotate secrets regularly
- Monitor logs for unauthorized access attempts

## Troubleshooting

### Common Issues

1. **Webhook not receiving messages**: Check that your server is publicly accessible and the port/path are correctly configured
2. **Signature validation failures**: Verify that the secret matches what's configured in DingTalk
3. **Messages not appearing in Moltbot**: Check Moltbot logs for processing errors

### Debugging Tips

- Enable verbose logging in Moltbot to see incoming/outgoing messages
- Use tools like ngrok for local development to expose your server publicly
- Check DingTalk's callback error logs in the DingTalk developer console