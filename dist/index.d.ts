interface ClawdbotPluginApi {
    config: ClawdbotConfig;
    logger: any;
    runtime: any;
    postMessage(params: any): Promise<void>;
    registerChannel(opts: {
        plugin: any;
    }): void;
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
declare const plugin: {
    id: string;
    name: string;
    description: string;
    configSchema: {
        type: "object";
        properties: {};
    };
    register(api: ClawdbotPluginApi): void;
};
export default plugin;
//# sourceMappingURL=index.d.ts.map