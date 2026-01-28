import { DWClient, DWClientDownStream } from 'dingtalk-stream';
import axios from 'axios';

// Define interfaces
interface ClawdbotPluginApi {
  config: ClawdbotConfig;
  logger: any;
  runtime: any;
  postMessage(params: any): Promise<void>;
  registerChannel(opts: { plugin: any }): void;
  registerService(service: any): void;
}

interface ClawdbotConfig {
  channels?: {
    'moltbot-dingtalk-stream'?: {
      accounts?: {
        [key: string]: DingTalkAccountConfig;
      };
    };
    [key: string]: any;
  };
}

interface DingTalkAccountConfig {
  enabled?: boolean;
  clientId: string;
  clientSecret: string;
  webhookUrl?: string;
  name?: string;
}

interface ResolvedDingTalkAccount {
  accountId: string;
  name?: string;
  enabled: boolean;
  configured: boolean;
  config: DingTalkAccountConfig;
}

interface DingTalkRobotMessage {
  conversationId: string;
  chatbotCorpId: string;
  chatbotUserId: string;
  msgId: string;
  senderNick: string;
  isAdmin: boolean;
  senderStaffId?: string;
  sessionWebhook: string;
  sessionWebhookExpiredTime: number;
  createAt: number;
  senderCorpId?: string;
  conversationType: '1' | '2';
  senderId: string;
  text?: {
    content: string;
  };
  msgtype: string;
}

// Store plugin runtime
let pluginRuntime: ClawdbotPluginApi | null = null;

// Store session webhooks for reply
const sessionWebhooks: Map<string, string> = new Map();
// Store active clients for each account
const activeClients: Map<string, DWClient> = new Map();

// Helper functions
function listDingTalkAccountIds(cfg: ClawdbotConfig): string[] {
  const accounts = cfg.channels?.['moltbot-dingtalk-stream']?.accounts;
  return accounts ? Object.keys(accounts) : [];
}

function resolveDingTalkAccount(opts: { cfg: ClawdbotConfig; accountId?: string }): ResolvedDingTalkAccount {
  const { cfg, accountId = 'default' } = opts;
  const account = cfg.channels?.['moltbot-dingtalk-stream']?.accounts?.[accountId];
  return {
    accountId,
    name: account?.name,
    enabled: account?.enabled ?? false,
    configured: Boolean(account?.clientId && account?.clientSecret),
    config: account || { clientId: '', clientSecret: '' }
  };
}

// DingTalk Channel Plugin
const dingTalkChannelPlugin = {
  id: "moltbot-dingtalk-stream",
  meta: {
    id: "moltbot-dingtalk-stream",
    label: "钉钉",
    selectionLabel: "DingTalk Bot (Stream)",
    docsPath: "/channels/moltbot-dingtalk-stream",
    docsLabel: "dingtalk",
    blurb: "钉钉机器人通道插件 (Stream模式)",
    order: 100,
    aliases: ["dt", "ding"],
  },
  capabilities: {
    chatTypes: ["direct", "group"] as const,
  },
  reload: { configPrefixes: ["channels.moltbot-dingtalk-stream"] },
  configSchema: {
    type: "object" as const,
    properties: {
      channels: {
        type: "object" as const,
        properties: {
          'moltbot-dingtalk-stream': {
            type: "object" as const,
            properties: {
              accounts: {
                type: "object" as const,
                additionalProperties: {
                  type: "object" as const,
                  properties: {
                    enabled: { type: "boolean" as const },
                    clientId: { type: "string" as const },
                    clientSecret: { type: "string" as const },
                    webhookUrl: { type: "string" as const },
                    name: { type: "string" as const },
                  },
                  required: ["clientId", "clientSecret"],
                },
              },
            },
          },
        },
      },
    },
  },
  config: {
    listAccountIds: (cfg: ClawdbotConfig) => listDingTalkAccountIds(cfg),
    resolveAccount: (cfg: ClawdbotConfig, accountId?: string) => resolveDingTalkAccount({ cfg, accountId }),
    defaultAccountId: (_cfg: ClawdbotConfig) => 'default',
    isConfigured: (account: ResolvedDingTalkAccount) => account.configured,
    describeAccount: (account: ResolvedDingTalkAccount) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.configured,
    }),
  },
  gateway: {
    startAccount: async (ctx: any) => {
      const account: ResolvedDingTalkAccount = ctx.account;
      const config = account.config;
      const accountId = account.accountId;

      if (!config.clientId || !config.clientSecret) {
        ctx.log?.warn?.(`[${accountId}] missing clientId or clientSecret`);
        return;
      }

      ctx.log?.info?.(`[${accountId}] starting DingTalk Stream client`);

      try {
        const client = new DWClient({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        });

        // Helper to safely handle messages
        const handleMessage = async (res: any) => {
          try {
            const message = JSON.parse(res.data);
            const textContent = message.text?.content || "";
            const senderId = message.senderId;
            const convoId = message.conversationId;
            const msgId = message.msgId;
            // Store session webhook if provided (DingTalk Stream mode provides this for replies)
            if (message.sessionWebhook) {
              sessionWebhooks.set(convoId, message.sessionWebhook);
            }

            // Log reception
            ctx.log?.info?.(`[${accountId}] received message from ${message.senderNick || senderId}: ${textContent}`);

            // Filter out empty messages
            if (!textContent) return;

            // Simple text cleaning (remove @bot mentions if possible, though DingTalk usually gives clean content or we might need to parse entities)
            const cleanedText = textContent.replace(/@\w+\s*/g, '').trim();

            // Forward the message to Clawdbot for processing
            if (pluginRuntime?.runtime?.channel?.reply) {
              const replyModule = pluginRuntime.runtime.channel.reply;
              const chatType = String(message.conversationType) === '2' ? 'group' : 'direct';
              const fromAddress = chatType === 'group' ? `dingtalk:group:${convoId}` : `dingtalk:${senderId}`;

              const ctxPayload = {
                Body: cleanedText,
                RawBody: textContent,
                CommandBody: cleanedText,
                From: fromAddress,
                To: 'bot',
                SessionKey: `dingtalk:${convoId}`,
                AccountId: accountId,
                ChatType: chatType,
                SenderName: message.senderNick,
                SenderId: senderId,
                Provider: 'dingtalk',
                Surface: 'dingtalk',
                MessageSid: message.msgId,
                Timestamp: message.createAt,
                // Required for some logic
                GroupSubject: chatType === 'group' ? (message.conversationId) : undefined,
              };

              const finalizedCtx = replyModule.finalizeInboundContext(ctxPayload);

              let replyBuffer = "";
              let replySent = false;

              const sendToDingTalk = async (text: string) => {
                if (!text) return;
                if (replySent) {
                  ctx.log?.info?.(`[${accountId}] Reply already sent, skipping buffer flush.`);
                  return;
                }

                const replyWebhook = sessionWebhooks.get(convoId) || config.webhookUrl;
                if (!replyWebhook) {
                  ctx.log?.error?.(`[${accountId}] No webhook to reply to ${convoId}`);
                  return;
                }

                try {
                  await axios.post(replyWebhook, {
                    msgtype: "text",
                    text: { content: text }
                  }, { headers: { 'Content-Type': 'application/json' } });
                  replySent = true;
                  ctx.log?.info?.(`[${accountId}] Reply sent successfully.`);
                } catch (e) {
                  ctx.log?.error?.(`[${accountId}] Failed to send reply: ${e}`);
                }
              };

              const dispatcher = {
                sendFinalReply: (payload: any) => {
                  const text = payload.text || payload.content || '';
                  sendToDingTalk(text).catch(e => ctx.log?.error?.(`[${accountId}] sendToDingTalk failed: ${e}`));
                  return true;
                },
                typing: async () => { },
                reaction: async () => { },
                isSynchronous: () => false,
                waitForIdle: async () => { },
                sendBlockReply: async (block: any) => {
                  // Accumulate text from blocks
                  const text = block.text || block.delta || block.content || '';
                  if (text) {
                    replyBuffer += text;
                  }
                },
                getQueuedCounts: () => ({ active: 0, queued: 0, final: 0 })
              };

              // Internal dispatch
              const dispatchPromise = replyModule.dispatchReplyFromConfig({
                ctx: finalizedCtx,
                cfg: pluginRuntime.config,
                dispatcher: dispatcher,
                replyOptions: {}
              });

              // ACK immediately to prevent retries
              if (res.headers && res.headers.messageId) {
                client.socketCallBackResponse(res.headers.messageId, { status: "SUCCEED" });
              }

              // Wait for run to finish
              await dispatchPromise;

              // If final reply wasn't called but we have buffer (streaming case where agent didn't return final payload?)
              if (!replySent && replyBuffer) {
                ctx.log?.info?.(`[${accountId}] Sending accumulated buffer from blocks (len=${replyBuffer.length}).`);
                await sendToDingTalk(replyBuffer);
              }

            } else {
              ctx.log?.error?.(`[${accountId}] runtime.channel.reply not available`);
            }
          } catch (error) {
            ctx.log?.error?.(`[${accountId}] error processing message: ${error instanceof Error ? error.message : String(error)}`);
            console.error('DingTalk Handler Error:', error);
          }
        };

        // Register callback for robot messages
        client.registerCallbackListener('/v1.0/im/bot/messages/get', handleMessage);

        // Connect to DingTalk Stream
        await client.connect();
        activeClients.set(accountId, client);
        ctx.log?.info?.(`[${accountId}] DingTalk Stream client connected`);

        // Handle abort signal for cleanup
        ctx.abortSignal?.addEventListener('abort', () => {
          ctx.log?.info?.(`[${accountId}] stopping DingTalk Stream client`);
          client.disconnect();
          activeClients.delete(accountId);
        });

      } catch (error) {
        ctx.log?.error?.(`[${accountId}] failed to start: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  },
  outbound: {
    deliveryMode: "direct" as const,
    sendText: async (opts: { text: string; account: ResolvedDingTalkAccount; target: string; senderId?: string }) => {
      const { text, account, target } = opts;
      const config = account.config;

      // Try session webhook first (for replies)
      const sessionWebhook = sessionWebhooks.get(target);

      if (sessionWebhook) {
        try {
          await axios.post(sessionWebhook, {
            msgtype: "text",
            text: { content: text }
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
          return { ok: true as const };
        } catch (error) {
          // Fall through to webhookUrl
        }
      }

      // Fallback to webhookUrl for proactive messages
      if (config?.webhookUrl) {
        try {
          await axios.post(config.webhookUrl, {
            msgtype: "text",
            text: { content: text }
          }, {
            headers: { 'Content-Type': 'application/json' }
          });
          return { ok: true as const };
        } catch (error) {
          return { ok: false as const, error: error instanceof Error ? error.message : String(error) };
        }
      }

      return { ok: false as const, error: "No webhook available for sending messages" };
    }
  }
};



// Plugin object format required by Clawdbot
const plugin = {
  id: "moltbot-dingtalk-stream",
  name: "DingTalk Channel",
  description: "DingTalk channel plugin using Stream mode",
  configSchema: {
    type: "object" as const,
    properties: {}
  },
  register(api: ClawdbotPluginApi) {
    pluginRuntime = api;
    api.registerChannel({ plugin: dingTalkChannelPlugin });
  }
};

export default plugin;