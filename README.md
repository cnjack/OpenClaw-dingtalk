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
# Install the plugin
moltbot plugins install @moltbot/dingtalk-channel

# Or for local development
moltbot plugins install -l ./path/to/dingtalk-channel
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
          "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=XXX",
          "secret": "XXXXXX",
          "token": "YourVerifyToken"
        }
      }
    }
  }
}
```

## Development

See the implementation details in the source code for how the channel integrates with Moltbot's plugin system.