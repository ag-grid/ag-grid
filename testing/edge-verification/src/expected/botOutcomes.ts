import { type Lifecycle, PENDING, finding } from './lifecycle';

/**
 * The crawler and agent families whose WAF outcomes the bot-outcomes area measures from the WAF
 * logs. `tokens` are lower-case substrings of the user agent (the first one that appears names
 * the family); `allowlistToken` is what the live p11 UA allowlist regex is tested with.
 *
 * Every family gets one check, judged on the rules that apply to it:
 * - requests Bot Control labelled bot:verified or bot:user_triggered:verified must be allowed;
 * - if the live p11 allowlist admits the family, its requests must be allowed, apart from blocks
 *   by a payload rule (CRS, KnownBadInputs, IpReputation, the credential-scanner rule), which
 *   catch a request's content, not its identity, and are mostly spoofs.
 *
 * `extra` adds a check on another population where today's outcome is a known defect, or one an
 * approved change fixes (each says which).
 */
export interface BotFamily {
    name: string;
    tokens: string[];
    allowlistToken?: string;
    refs?: string[];
    extra?: Array<
        Lifecycle & {
            /** Payload-rule blocks are left out of every extra population. */
            population: 'unverified' | 'all';
            /** Why this population is judged, and what is measured today. */
            why: string;
        }
    >;
}

const p11Script = PENDING.p11AgentAllowlist;

/** Families measured as blocked today that extend-p11-agent-allowlist.sh admits (waf-finding.md §6). */
const admittedByP11Script = (why: string): BotFamily['extra'] => [
    { population: 'all', pending: p11Script, why: `${why} (${finding(6)})` },
];

export const BOT_FAMILIES: BotFamily[] = [
    // Search crawlers
    { name: 'Googlebot', tokens: ['googlebot'] },
    { name: 'Bingbot', tokens: ['bingbot'] },
    {
        name: 'Applebot',
        tokens: ['applebot'],
        extra: [
            {
                population: 'unverified',
                pending: p11Script,
                why: `Bot Control misses verification for 0.4-0.6% of Applebot, mostly from verified /16s (${finding(6)})`,
            },
        ],
    },
    {
        name: 'DuckDuckBot',
        tokens: ['duckduckbot'],
        extra: [
            {
                population: 'unverified',
                pending: p11Script,
                why: `unverified DuckDuckBot from the same /16s as verified traffic is blocked (${finding(6)})`,
            },
        ],
    },
    {
        name: 'DuckAssistBot',
        tokens: ['duckassistbot'],
        extra: [
            {
                population: 'unverified',
                pending: p11Script,
                why: `unverified DuckAssistBot is blocked (${finding(6)})`,
            },
        ],
    },
    { name: 'YandexBot', tokens: ['yandexbot'] },
    { name: 'GoogleOther', tokens: ['googleother'] },
    { name: 'Google-InspectionTool', tokens: ['google-inspectiontool'] },
    // AI crawlers and user-triggered fetchers
    { name: 'GPTBot', tokens: ['gptbot'] },
    { name: 'ChatGPT-User', tokens: ['chatgpt-user'] },
    { name: 'OAI-SearchBot', tokens: ['oai-searchbot'] },
    { name: 'ClaudeBot', tokens: ['claudebot'] },
    { name: 'Claude-User', tokens: ['claude-user', 'claude-code'] },
    { name: 'Claude-SearchBot', tokens: ['claude-searchbot'] },
    { name: 'PerplexityBot', tokens: ['perplexitybot'] },
    {
        name: 'Perplexity-User',
        tokens: ['perplexity-user'],
        extra: admittedByP11Script('in the robots AI group but not the p11 allowlist'),
    },
    { name: 'Meta-ExternalAgent', tokens: ['meta-externalagent'] },
    {
        name: 'Meta-WebIndexer',
        tokens: ['meta-webindexer'],
        extra: admittedByP11Script('Meta AI search indexer, effectively 100% blocked by p11'),
    },
    { name: 'Amazonbot', tokens: ['amazonbot'] },
    { name: 'CCBot', tokens: ['ccbot'] },
    {
        name: 'Bytespider',
        tokens: ['bytespider'],
        extra: [
            {
                population: 'all',
                knownIssue: `${finding(5)} (welcomed by the robots AI group, blocked by Bot Control at p9 before p11 runs; the p11 script does not change this)`,
                why: 'robots.txt welcomes it',
            },
        ],
    },
    {
        name: 'MistralAI-User',
        tokens: ['mistralai-user'],
        extra: admittedByP11Script('user-triggered fetcher blocked by p11'),
    },
    // Smaller agents and fetchers p11 blocks today (waf-finding.md §6)
    { name: 'Amazon-Quick', tokens: ['amazon-quick'], extra: admittedByP11Script('Amazon Quick agent') },
    {
        name: 'ModelContextProtocol',
        tokens: ['modelcontextprotocol'],
        extra: admittedByP11Script('the MCP fetch server'),
    },
    { name: 'cohere-ai', tokens: ['cohere-ai'], extra: admittedByP11Script('Cohere fetcher') },
    { name: 'YouBot', tokens: ['youbot'], extra: admittedByP11Script('You.com crawler') },
    { name: 'KiroServer', tokens: ['kiroserver'], extra: admittedByP11Script('Kiro agent') },
    // Link previews
    { name: 'Chrome-Lighthouse', tokens: ['chrome-lighthouse'] },
    { name: 'facebookexternalhit', tokens: ['facebookexternalhit'] },
    { name: 'Twitterbot', tokens: ['twitterbot'] },
    { name: 'Slackbot', tokens: ['slackbot'] },
    { name: 'LinkedInBot', tokens: ['linkedinbot'] },
    { name: 'Discordbot', tokens: ['discordbot'] },
    { name: 'GitHub-camo', tokens: ['github-camo'] },
    { name: 'Mattermost', tokens: ['mattermost'], extra: admittedByP11Script('Mattermost link preview') },
    { name: 'WebexTeams', tokens: ['webexteams'], extra: admittedByP11Script('Webex link preview') },
    { name: 'ZohoChat', tokens: ['zohochat'], extra: admittedByP11Script('Zoho link preview') },
    { name: 'Synapse', tokens: ['synapse'], extra: admittedByP11Script('Matrix Synapse link preview') },
    { name: 'KakaoTalk', tokens: ['kakaotalk'], extra: admittedByP11Script('KakaoTalk link preview') },
    { name: 'LINE', tokens: ['line-poker'], extra: admittedByP11Script('LINE link preview') },
    {
        name: 'Chrome-Prefetch-Proxy',
        tokens: ['chrome privacy preserving prefetch proxy'],
        extra: admittedByP11Script('Chrome privacy-preserving prefetch proxy'),
    },
];

export const BOT_OUTCOME_DEFAULTS = {
    windowMs: 2 * 3_600_000,
    /** 1% */
    maxNonAllowShare: 0.01,
    minVolume: 100,
    /** Insights bills per byte scanned; 2h ingests ~1.2 GB and the estimate doubles it (SCAN_TO_INGEST_FACTOR). */
    maxBytes: 4e9,
};

export const BOT_OUTCOME_REFS = ['SE-78', 'SE-184', finding(5), finding(6)];
