export declare const CHANNEL_ID = "moltbot-dingtalk-stream";
export declare const DEFAULT_ACCOUNT_ID = "default";
export type VerboseLevel = "off" | "on" | "full";
export interface DingTalkAccountConfig {
    enabled?: boolean;
    clientId?: string;
    clientSecret?: string;
    webhookUrl?: string;
    name?: string;
    groupPolicy?: "open" | "allowlist";
    requireMention?: boolean;
    dm?: {
        policy?: "open" | "pairing" | "allowlist";
        allowFrom?: string[];
    };
    verboseLevel?: VerboseLevel;
}
export interface ResolvedDingTalkAccount {
    accountId: string;
    name?: string;
    enabled: boolean;
    configured: boolean;
    clientId: string;
    clientSecret: string;
    tokenSource: "config" | "env" | "none";
    verboseLevel: VerboseLevel;
    config: DingTalkAccountConfig;
}
export interface DingTalkChannelConfig {
    enabled?: boolean;
    clientId?: string;
    clientSecret?: string;
    webhookUrl?: string;
    name?: string;
    groupPolicy?: "open" | "allowlist";
    requireMention?: boolean;
    dm?: {
        policy?: "open" | "pairing" | "allowlist";
        allowFrom?: string[];
    };
    verboseLevel?: VerboseLevel;
    accounts?: Record<string, DingTalkAccountConfig>;
}
export interface OpenClawConfig {
    channels?: {
        [CHANNEL_ID]?: DingTalkChannelConfig;
        defaults?: {
            groupPolicy?: "open" | "allowlist";
        };
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
export declare const DingTalkConfigSchema: {
    type: "object";
    properties: {
        enabled: {
            type: "boolean";
        };
        clientId: {
            type: "string";
        };
        clientSecret: {
            type: "string";
        };
        webhookUrl: {
            type: "string";
        };
        name: {
            type: "string";
        };
        groupPolicy: {
            type: "string";
            enum: string[];
        };
        requireMention: {
            type: "boolean";
        };
        verboseLevel: {
            type: "string";
            enum: string[];
        };
        dm: {
            type: "object";
            properties: {
                policy: {
                    type: "string";
                    enum: string[];
                };
                allowFrom: {
                    type: "array";
                    items: {
                        type: "string";
                    };
                };
            };
        };
        accounts: {
            type: "object";
            additionalProperties: {
                type: "object";
                properties: {
                    enabled: {
                        type: "boolean";
                    };
                    clientId: {
                        type: "string";
                    };
                    clientSecret: {
                        type: "string";
                    };
                    webhookUrl: {
                        type: "string";
                    };
                    name: {
                        type: "string";
                    };
                    verboseLevel: {
                        type: "string";
                        enum: string[];
                    };
                };
                required: string[];
            };
        };
    };
};
export declare function listDingTalkAccountIds(cfg: OpenClawConfig): string[];
export declare function resolveDingTalkAccount(opts: {
    cfg: OpenClawConfig;
    accountId?: string;
}): ResolvedDingTalkAccount;
export declare function resolveDefaultDingTalkAccountId(cfg: OpenClawConfig): string;
export declare function normalizeAccountId(accountId?: string): string;
export declare function setAccountEnabledInConfig(opts: {
    cfg: OpenClawConfig;
    accountId: string;
    enabled: boolean;
}): OpenClawConfig;
export declare function deleteAccountFromConfig(opts: {
    cfg: OpenClawConfig;
    accountId: string;
}): OpenClawConfig;
export declare function applyAccountNameToConfig(opts: {
    cfg: OpenClawConfig;
    accountId: string;
    name?: string;
}): OpenClawConfig;
//# sourceMappingURL=schema.d.ts.map