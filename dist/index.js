"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerDingTalkPlugin;
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const dingTalkChannel = {
    id: "dingtalk",
    meta: {
        id: "dingtalk",
        label: "钉钉",
        selectionLabel: "DingTalk Bot",
        docsPath: "/channels/dingtalk",
        blurb: "钉钉自定义机器人通道插件"
    },
    capabilities: {
        chatTypes: ["direct", "group"],
        features: ["text", "reactions"]
    },
    config: {
        listAccountIds: (cfg) => {
            const accounts = cfg.channels?.dingtalk?.accounts;
            return accounts ? Object.keys(accounts) : [];
        },
        resolveAccount: (cfg, accountId) => {
            const account = cfg.channels?.dingtalk?.accounts?.[accountId];
            return {
                id: accountId,
                config: account
            };
        }
    },
    outbound: {
        deliveryMode: "direct",
        sendText: async ({ text, account, convoId, senderId }) => {
            const config = account.config;
            if (!config.webhookUrl) {
                return { ok: false, error: "Missing webhook URL" };
            }
            try {
                // Prepare the message payload
                const messagePayload = {
                    msgtype: "text",
                    text: {
                        content: text
                    }
                };
                let url = config.webhookUrl;
                // If secret is provided, add signature for security
                if (config.secret) {
                    const timestamp = Date.now();
                    const base = `${timestamp}\n${config.secret}`;
                    const sign = crypto_1.default
                        .createHmac('sha256', config.secret)
                        .update(base)
                        .digest('base64');
                    url = `${config.webhookUrl}&timestamp=${timestamp}&sign=${sign}`;
                }
                // Send the message to DingTalk
                await axios_1.default.post(url, messagePayload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                return { ok: true };
            }
            catch (error) {
                console.error('Error sending message to DingTalk:', error);
                return { ok: false, error: error instanceof Error ? error.message : String(error) };
            }
        }
    }
};
// Gateway plugin to handle incoming messages
const dingTalkGateway = {
    async start(api) {
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        // Get the channel config
        const config = api.config;
        const accounts = config.channels?.dingtalk?.accounts || {};
        for (const [accountId, accountConfig] of Object.entries(accounts)) {
            if (accountConfig.enabled && accountConfig.webhook) {
                const webhookConfig = accountConfig.webhook;
                const token = accountConfig.token;
                const secret = accountConfig.secret;
                const callbackPath = webhookConfig.path || '/dingtalk/callback';
                const callbackPort = webhookConfig.port || 3000;
                api.logger.info(`Setting up DingTalk webhook for account ${accountId} on port ${callbackPort}${callbackPath}`);
                app.post(callbackPath, async (req, res) => {
                    try {
                        // Verify the request if token is configured
                        if (token) {
                            // Basic token verification - some implementations put token in headers
                            const receivedToken = req.headers['token'] || req.query.token;
                            if (receivedToken !== token) {
                                api.logger.warn('Invalid token received for DingTalk webhook');
                                res.status(403).send('Forbidden: Invalid token');
                                return;
                            }
                        }
                        // If secret is configured, verify the signature
                        if (secret) {
                            const timestamp = req.headers['timestamp'];
                            const sign = req.headers['sign'];
                            if (!timestamp || !sign) {
                                api.logger.warn('Missing timestamp or sign in DingTalk webhook headers');
                                res.status(403).send('Forbidden: Missing signature');
                                return;
                            }
                            // Recalculate the expected signature
                            const expectedSign = crypto_1.default
                                .createHmac('sha256', secret)
                                .update(`${timestamp}\n${secret}`)
                                .digest('base64');
                            if (sign !== expectedSign) {
                                api.logger.warn('Invalid signature received for DingTalk webhook');
                                res.status(403).send('Forbidden: Invalid signature');
                                return;
                            }
                        }
                        // Parse the received message
                        const data = req.body;
                        api.logger.info(`Received DingTalk message: ${JSON.stringify(data)}`);
                        // Extract message information
                        const textContent = data.text?.content || '';
                        const senderId = data.senderStaffId || data.senderId || 'unknown';
                        const convoId = data.conversationId || 'default';
                        // Clean up the message content - remove @mentions of the bot if present
                        const cleanedText = textContent.replace(/@\w+\s*/g, '').trim();
                        // Forward the message to Moltbot for processing
                        await api.postMessage({
                            channel: 'dingtalk',
                            accountId: accountId,
                            senderId: senderId,
                            chatId: convoId,
                            text: cleanedText
                        });
                        // Respond to DingTalk that the message was received
                        res.send({ success: true });
                    }
                    catch (error) {
                        api.logger.error(`Error processing DingTalk webhook: ${error instanceof Error ? error.message : String(error)}`);
                        res.status(500).send('Internal Server Error');
                    }
                });
            }
        }
        // Start the server
        const server = app.listen(3000);
        // Store the server instance to allow cleanup
        api._dingtalkServer = server;
    },
    async stop(api) {
        // Cleanup: close the server if it exists
        const server = api._dingtalkServer;
        if (server) {
            server.close();
        }
    }
};
// Export the plugin registration function
function registerDingTalkPlugin(api) {
    if (api && typeof api.registerChannel === 'function') {
        api.registerChannel(dingTalkChannel);
    }
    if (api && typeof api.registerGatewayPlugin === 'function') {
        api.registerGatewayPlugin(dingTalkGateway);
    }
}
//# sourceMappingURL=index.js.map