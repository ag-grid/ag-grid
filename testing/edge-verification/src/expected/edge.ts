import { type Lifecycle, PENDING, finding } from './lifecycle';

/**
 * The expected state of the AWS edge for www.ag-grid.com, declared in one place so that every
 * change to it goes through review. The AWS checks compare the live configuration with this.
 *
 * Changing production by hand (the repo-root *.sh scripts) without updating this file makes the
 * suite fail - that is the point: it catches drift.
 *
 * Secrets never appear here. Checks that involve a secret compare live values with each other
 * in memory and report only header names and lengths.
 */

export const ACCOUNT_ID = '116606402151';
export const DISTRIBUTION_ID = 'E2SJ3W7448VC28';

export const ALL_METHODS = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'];

// ---------------------------------------------------------------------------------------------
// CloudFront
// ---------------------------------------------------------------------------------------------

export interface CachePolicyExpectation extends Lifecycle {
    name: string;
    /** Managed policies have fixed ids; custom ones are looked up by name. */
    id?: string;
    minTtl: number;
    defaultTtl: number;
    maxTtl: number;
    /** Headers in the cache key (lower-cased, order-insensitive). Empty = none. */
    keyHeaders: string[];
    cookies: 'none' | 'all' | 'whitelist' | 'allExcept';
    queryStrings: 'none' | 'all' | 'whitelist' | 'allExcept';
    gzip: boolean;
    brotli: boolean;
}

export const CACHE_POLICIES: CachePolicyExpectation[] = [
    {
        name: 'Managed-CachingDisabled',
        id: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
        minTtl: 0,
        defaultTtl: 0,
        maxTtl: 0,
        keyHeaders: [],
        cookies: 'none',
        queryStrings: 'none',
        gzip: false,
        brotli: false,
    },
    {
        name: 'CachingOptimizedWithHost',
        id: '0d7761aa-2a95-46d3-804d-93f085837f38',
        minTtl: 1,
        defaultTtl: 86400,
        maxTtl: 31536000,
        // Host keeps www, the apex and the legacy aliases apart (they redirect differently).
        keyHeaders: ['host'],
        cookies: 'none',
        queryStrings: 'none',
        gzip: true,
        brotli: true,
    },
    {
        // add-archive-cache-behaviors.sh copies CachingOptimizedWithHost and adds the markdown
        // split header to the key; everything else is identical to the source.
        name: 'CachingOptimizedWithHostAndMarkdown',
        minTtl: 1,
        defaultTtl: 86400,
        maxTtl: 31536000,
        keyHeaders: ['host', 'x-ag-accept-markdown'],
        cookies: 'none',
        queryStrings: 'none',
        gzip: true,
        brotli: true,
        pending: PENDING.archiveCache,
    },
];

export const ORIGIN_REQUEST_POLICIES = {
    'Managed-AllViewer': '216adef6-5c7f-47e4-b989-5492eafa07d3',
} as const;

/** The viewer-request function that splits the archive cache key on Accept: text/markdown. */
export const MARKDOWN_KEY_FUNCTION = 'archive-markdown-cache-key';
export const MARKDOWN_KEY_HEADER = 'x-ag-accept-markdown';

export interface BehaviourExpectation extends Lifecycle {
    pattern: string;
    cachePolicy: string;
    originRequestPolicy: keyof typeof ORIGIN_REQUEST_POLICIES;
    /** viewer-request CloudFront Functions, by name. */
    viewerRequestFunctions: string[];
    allowedMethods: string[];
    /** Why the behaviour exists - printed when it drifts. */
    why: string;
}

const cachedAsset = (pattern: string, why: string): BehaviourExpectation => ({
    pattern,
    cachePolicy: 'CachingOptimizedWithHost',
    originRequestPolicy: 'Managed-AllViewer',
    viewerRequestFunctions: [],
    allowedMethods: ALL_METHODS,
    why,
});

/**
 * Ordered exactly as on the distribution (first match wins). Pending entries are excluded when
 * comparing the deployed order, then checked on their own.
 *
 * Every behaviour still allows all 7 methods (waf-finding.md §14 suggests GET/HEAD/OPTIONS on the
 * static ones; that is not scheduled, so it is not declared here).
 */
export const BEHAVIOURS: BehaviourExpectation[] = [
    {
        pattern: '/example/',
        cachePolicy: 'Managed-CachingDisabled',
        originRequestPolicy: 'Managed-AllViewer',
        viewerRequestFunctions: [],
        allowedMethods: ALL_METHODS,
        why: 'the /example/ demo page negotiates markdown; must stay ahead of /example/* (2026-09 cache-poisoning incident)',
    },
    {
        pattern: '/example/index.html',
        cachePolicy: 'Managed-CachingDisabled',
        originRequestPolicy: 'Managed-AllViewer',
        viewerRequestFunctions: [],
        allowedMethods: ALL_METHODS,
        why: 'DirectoryIndex form of /example/; must stay ahead of /example/*',
    },
    cachedAsset('*/_astro/*', 'hashed build assets on grid, charts, studio and archives'),
    cachedAsset('/images/*', 'unhashed images, 1-day origin max-age'),
    cachedAsset('/example-assets/*', 'example data and images'),
    cachedAsset('/favicon.ico', 'SE-186/SE-189'),
    cachedAsset('/robots.txt', 'SE-189'),
    cachedAsset('/_astro/*', 'shadowed by */_astro/* (kept for clarity, same policy)'),
    cachedAsset('/example/*', 'example page assets (Twitter storm 2026-09-18)'),
    cachedAsset('/scripts/*', 'unhashed scripts, 1-day origin max-age'),
    cachedAsset('/theme-icons/*', 'theme icon downloads'),
    cachedAsset('/charts/scripts/*', 'charts unhashed scripts'),
    cachedAsset('/studio/scripts/*', 'studio unhashed scripts'),
    cachedAsset('/studio/images/*', 'studio images'),
    cachedAsset('/studio/videos/*', 'studio videos'),
    // add-archive-cache-behaviors.sh: appended after every existing behaviour, copied from
    // DefaultCacheBehavior (so all 7 methods, waf-finding.md §4 suggests narrowing them).
    {
        pattern: '/archive/*',
        cachePolicy: 'CachingOptimizedWithHostAndMarkdown',
        originRequestPolicy: 'Managed-AllViewer',
        viewerRequestFunctions: [MARKDOWN_KEY_FUNCTION],
        allowedMethods: ALL_METHODS,
        why: 'released grid archives are 58% of origin requests (waf-finding.md §8)',
        pending: PENDING.archiveCache,
    },
    {
        pattern: '/charts/archive/*',
        cachePolicy: 'CachingOptimizedWithHostAndMarkdown',
        originRequestPolicy: 'Managed-AllViewer',
        viewerRequestFunctions: [MARKDOWN_KEY_FUNCTION],
        allowedMethods: ALL_METHODS,
        why: 'released charts archives (waf-finding.md §8)',
        pending: PENDING.archiveCache,
    },
];

export const DEFAULT_BEHAVIOUR = {
    cachePolicy: 'Managed-CachingDisabled',
    originRequestPolicy: 'Managed-AllViewer' as const,
    viewerRequestFunctions: [] as string[],
    allowedMethods: ALL_METHODS,
    viewerProtocolPolicy: 'redirect-to-https',
    compress: true,
    realtimeLogConfig: 'cf-kinesis-real-time-logs-config',
};

export const DISTRIBUTION = {
    aliases: [
        'www.ag-grid.com',
        'ag-grid.com',
        'charts.ag-grid.com',
        'javascript-grid.ag-grid.com',
        'angulargrid.ag-grid.com',
        'react-grid.ag-grid.com',
        'mta-sts.ag-grid.com',
        'angular-grid.ag-grid.com',
        'blog.ag-grid.com',
    ],
    webAclName: 'cloudfront-web-acl',
    httpVersion: 'http2',
    ipv6: true,
    minimumProtocolVersion: 'TLSv1.2_2021',
    sslSupportMethod: 'sni-only',
    origin: {
        domain: 'ag-grid-lb1-585556639.us-west-1.elb.amazonaws.com',
        protocolPolicy: 'https-only',
        /** Names only; the value is compared with the ALB rule in memory. */
        customHeaderNames: ['x-ag-origin-verify'],
        readTimeout: 30,
        // waf-finding.md §8 fix 6 suggests 1-2; not scheduled, so the live value is declared.
        connectionAttempts: 3,
    },
    originShield: {
        enabled: true,
        region: 'us-west-1',
        pending: `${finding(8)} fix 2 (Origin Shield in us-west-1) - no script yet`,
    },
    standardLogging: false,
};

/** SE-116 / SE-117: LogLens reads these as positional TSV, so the order is the contract. */
export const REALTIME_LOG_CONFIG = {
    name: 'cf-kinesis-real-time-logs-config',
    samplingRate: 100,
    fields: [
        'timestamp',
        'c-ip',
        'time-to-first-byte',
        'sc-status',
        'sc-bytes',
        'cs-method',
        'cs-protocol',
        'cs-host',
        'cs-uri-stem',
        'cs-bytes',
        'x-edge-location',
        'x-edge-request-id',
        'x-host-header',
        'time-taken',
        'cs-protocol-version',
        'cs-user-agent',
        'cs-referer',
        'cs-cookie',
        'x-edge-response-result-type',
        'x-edge-result-type',
        'sc-content-type',
        'c-port',
        'c-country',
    ],
};

// ---------------------------------------------------------------------------------------------
// WAF
// ---------------------------------------------------------------------------------------------

export type WafAction = 'Allow' | 'Block' | 'Count' | 'Captcha' | 'Challenge' | 'None';

/** One RuleActionOverride on a managed group: the group rule it names and the action it uses instead. */
export interface OverrideExpectation {
    name: string;
    action: WafAction;
}

/**
 * A managed rule group's complete override set. Compared exactly: a missing override re-enables a
 * rule, an extra one quietly disables (Count) or changes it.
 */
export interface ManagedGroupExpectation {
    overrides: OverrideExpectation[];
    /** Overrides a pending script adds. Present or absent, the group passes; the pending check reports which. */
    pendingOverrides?: Array<OverrideExpectation & { pending: string }>;
}

export interface RuleExpectation extends Lifecycle {
    name: string;
    /** Action, or the OverrideAction for rule groups ('None'). */
    action: WafAction;
    metricName?: string;
    /**
     * Pending rules: the rule this one follows. Only other pending rules with the same `after` may
     * sit between them, so two scripts that each insert straight after it pass in either order.
     */
    after?: string;
}

export interface IpSetExpectation {
    name: string;
    id: string;
    /** Exactly these, IPv4. */
    addresses: string[];
}

/**
 * The headers redact-waf-log-secrets.sh redacts on both ACLs' logs, in its order: the four verify
 * secrets, and the viewer's own cookie and authorization.
 */
const REDACTED_HEADERS = [
    'x-lambda-verify',
    'x-ag-ci-verify',
    'x-aud-bot-verify',
    'x-ag-origin-verify',
    'cookie',
    'authorization',
];

export const CF_ACL = {
    name: 'cloudfront-web-acl',
    id: '11c3c216-4b6c-4b17-9ea2-8d3183d00104',
    scope: 'CLOUDFRONT',
    region: 'us-east-1',
    defaultAction: 'Allow',
    tokenDomains: ['ag-grid.com'],
    captchaImmunity: 3600,
    /** The whole ACL apart from its rules (live 2026-10-01): see aclSettings in wafRules.ts. */
    visibilityMetric: 'cloudfront-web-acl',
    onSourceDDoSProtection: { ALBLowReputationMode: 'ACTIVE_UNDER_DDOS' },
    customBodies: {
        'automated-access-blocked': {
            contentType: 'TEXT_PLAIN',
            // The body agents read when p11 blocks them: it points them at the routes they may use.
            content: [
                '403 - automated access to this URL is blocked.',
                '',
                'AG Grid content is available to agents and scripts without restriction:',
                '  - Append .md to any page URL       https://www.ag-grid.com/javascript-data-grid/getting-started.md',
                '  - Or send the header               Accept: text/markdown',
                '  - Index of everything              https://www.ag-grid.com/llms.txt',
                '  - MCP server for coding assistants https://www.ag-grid.com/javascript-data-grid/mcp-server/',
                '',
                'If you believe this block is wrong, contact https://ag-grid.zendesk.com/ quoting the',
                'x-amz-cf-id response header.',
                '',
            ].join('\n'),
        },
    },
    /** In priority order. The Shield group (priority 10000000) is checked separately. */
    rules: [
        { name: 'allow-trusted-mcp-lambda', action: 'Allow', metricName: 'allow-trusted-lambda' },
        { name: 'allow-trusted-ci-archive-tests', action: 'Allow', metricName: 'allow-trusted-lambda' },
        { name: 'allow-seo-bot', action: 'Allow', metricName: 'aud-bot-trusted' },
        { name: 'allow-internal-ec2', action: 'Allow', metricName: 'allow-internal-ec2' },
        { name: 'allow-mta-sts-policy', action: 'Allow', metricName: 'allowMtaStsPolicy' },
        { name: 'AWS-AWSManagedRulesAmazonIpReputationList', action: 'None' },
        { name: 'AWS-AWSManagedRulesCommonRuleSet', action: 'None' },
        { name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet', action: 'None' },
        { name: 'AWS-AWSManagedRulesAntiDDoSRuleSet', action: 'None' },
        { name: 'AWS-AWSManagedRulesBotControlRuleSet', action: 'None' },
        { name: 'block-credential-scanner-paths', action: 'Block', metricName: 'block-credential-scanner-paths' },
        { name: 'block-nonbrowser-except-ai-assistants', action: 'Block', metricName: 'blockNonBrowserExceptAI' },
        // Two pending scripts each insert one rule straight after p11; whichever runs second
        // lands next to p11. So each is declared relative to p11 (see `after`), never by priority.
        {
            name: 'block-datacenter-except-agent-paths',
            action: 'Block',
            metricName: 'blockDataCenterExceptAgentPaths',
            after: 'block-nonbrowser-except-ai-assistants',
            pending: PENDING.datacenterAfterAgents,
        },
        {
            name: 'count-allowlisted-agents-rate',
            action: 'Count',
            metricName: 'countAllowlistedAgentsRate',
            after: 'block-nonbrowser-except-ai-assistants',
            pending: PENDING.p11AgentAllowlist,
        },
        {
            name: 'soft-rate-limit-docs-with-captch-count',
            action: 'Count',
            metricName: 'soft-rate-limit-docs-with-captch-count',
        },
        {
            name: 'soft-rate-limit-rule-with-captcha',
            action: 'Captcha',
            metricName: 'soft-rate-limit-rule-with-captcha',
        },
        {
            name: 'hard-rate-limit-rule-with-blocking',
            action: 'Block',
            metricName: 'hard-rate-limit-rule-with-blocking',
        },
        {
            name: 'soft-rate-limit-flat-with-captcha-flat',
            action: 'Captcha',
            metricName: 'soft-rate-limit-flat-with-captcha-flat',
        },
        { name: 'count-nonbrowser-safe-paths', action: 'Count', metricName: 'countNonBrowserSafePaths' },
        { name: 'challenge-automated-browser-documents', action: 'Challenge', metricName: 'challengeAutomatedBrowser' },
    ] as RuleExpectation[],

    /** Shared-secret Allow rules: header name, and whether it is also scoped to a path prefix. */
    verifyHeaderRules: [
        { rule: 'allow-trusted-mcp-lambda', header: 'x-lambda-verify' },
        { rule: 'allow-trusted-ci-archive-tests', header: 'x-ag-ci-verify', pathPrefix: '/archive/' },
        { rule: 'allow-seo-bot', header: 'x-aud-bot-verify' },
    ],
    // 63.35.81.33/32 was added by hand on 2026-09-30 (CloudTrail UpdateIPSet, seanlandsman) and
    // is intended (confirmed 2026-10-01): both entries are the expected state.
    buildServerIpSet: {
        name: 'build-server',
        id: '11c2b109-7a3d-4252-8ccd-0eee28fbb8c5',
        addresses: ['52.50.158.57/32', '63.35.81.33/32'],
    } as IpSetExpectation,
    /** Live 2026-10-01: both matches lowercase first. */
    mtaSts: { host: 'mta-sts.ag-grid.com', path: '/.well-known/mta-sts.txt', transforms: ['LOWERCASE'] },

    /** Live 2026-10-01: the first prefix is matched as-is, the other two after LOWERCASE. */
    commonRuleSetExemptions: [
        { prefix: '/blog/ghost/api/', transforms: ['NONE'] },
        { prefix: '/rss/', transforms: ['LOWERCASE'] },
        { prefix: '/_astro/favicon-', transforms: ['LOWERCASE'] },
    ],

    /** Every managed group on the ACL, by rule name (live 2026-10-01). */
    managedGroups: {
        'AWS-AWSManagedRulesAmazonIpReputationList': { overrides: [] },
        'AWS-AWSManagedRulesCommonRuleSet': { overrides: [] },
        'AWS-AWSManagedRulesKnownBadInputsRuleSet': { overrides: [] },
        'AWS-AWSManagedRulesAntiDDoSRuleSet': { overrides: [] },
        // Count keeps each rule's label for p11 and the later rules while it stops blocking.
        'AWS-AWSManagedRulesBotControlRuleSet': {
            overrides: [
                'CategoryAI',
                'SignalNonBrowserUserAgent',
                'CategorySocialMedia',
                'CategoryContentFetcher',
                'CategoryMiscellaneous',
                'CategoryHttpLibrary',
                'SignalAutomatedBrowser',
            ].map((name) => ({ name, action: 'Count' as const })),
            // The data-centre block moves after p11's exemptions; the label stays for it to match.
            pendingOverrides: [
                { name: 'SignalKnownBotDataCenter', action: 'Count', pending: PENDING.datacenterAfterAgents },
            ],
        },
    } as Record<string, ManagedGroupExpectation>,

    antiDdos: {
        challenge: 'ENABLED',
        sensitivity: 'HIGH',
        sensitivityToBlock: 'LOW',
        exemptUriRegex:
            '\\/api\\/|\\.(acc|avi|css|gif|ico|jpe?g|js|json|mp[34]|ogg|otf|pdf|png|tiff?|ttf|webm|webp|woff2?|xml)$',
        /** Agent-facing paths the exemption should cover (waf-finding.md §7 says it does not). */
        shouldExempt: ['/llms.txt', '/react-data-grid/getting-started.md', '/images/moon.svg', '/blog/rss/'],
    },

    botControl: { inspectionLevel: 'COMMON' },

    /**
     * The verified-bot labels block-datacenter-except-agent-paths exempts, alongside p11's own
     * Accept: text/markdown condition (move-datacenter-block-after-agent-exemptions.sh).
     */
    dataCentreLabel: 'awswaf:managed:aws:bot-control:signal:known_bot_data_center',
    dataCentreVerifiedLabels: [
        'awswaf:managed:aws:bot-control:bot:verified',
        'awswaf:managed:aws:bot-control:bot:user_triggered:verified',
        'awswaf:managed:aws:bot-control:bot:developer_platform:verified',
    ],

    credentialScanner: {
        regex: '\\.git/|\\.env(\\.|_|[0-9]|$)|id_rsa|\\.ssh/|\\.aws/credentials',
        /** Lowercased, then URL-decoded, so /.ENV and /%2Eenv are caught too. */
        transforms: ['LOWERCASE', 'URL_DECODE'],
        /** SE-185: must match. */
        blocked: ['/.env', '/.env.local', '/.git/config', '/id_rsa', '/.ssh/id_rsa', '/.aws/credentials', '/%2Eenv'],
        /** Must not match: real content. */
        allowed: [
            '/environment/',
            '/react-data-grid/getting-started/',
            '/blog/git-tips/',
            '/charts/javascript/envelope/',
        ],
    },

    /** p11 block-nonbrowser-except-ai-assistants. */
    nonBrowser: {
        triggerLabels: [
            'awswaf:managed:aws:bot-control:signal:non_browser_user_agent',
            'awswaf:managed:aws:bot-control:bot:category:ai',
        ],
        /** Every token must be matched by the live UA allowlist regex. */
        uaAllowTokens: [
            'chatgpt-user',
            'claude-user',
            'claude-code',
            'oai-searchbot',
            'perplexitybot',
            'gptbot',
            'claudebot',
            'claude-searchbot',
            'ccbot',
            'github-camo',
            'meta-externalagent',
            'amazonbot',
        ],
        exemptLabels: [
            'awswaf:managed:aws:bot-control:bot:verified',
            'awswaf:managed:aws:bot-control:bot:category:social_media',
            'awswaf:managed:aws:bot-control:bot:user_triggered:verified',
        ],
        /** UA fragments exempted by their own regexes (Apple link previews, in-app browsers). */
        otherUaExemptions: [
            'com.apple.webkit.networking',
            'networkingextension',
            'fban/',
            'fbav/',
            'fb_iab',
            'instagram',
        ],
        /** The other p11 UA regexes, exactly as live (2026-10-01). */
        otherUaRegexes: ['(com\\.apple\\.webkit\\.networking|networkingextension)', '(fban/|fbav/|fb_iab|instagram)'],
        /** Ordinary non-browser UAs that no p11 UA exemption may admit: a regex that does is not one of the declared two. */
        undeclaredUas: ['curl/8.4.0', 'python-requests/2.31.0', 'go-http-client/1.1', 'wget/1.21.4'],
        /** extend-p11-agent-allowlist.sh appends these (lower-cased: p11 applies LOWERCASE). */
        pendingUaAllowTokens: {
            pending: PENDING.p11AgentAllowlist,
            tokens: [
                'meta-webindexer',
                'perplexity-user',
                'amazon-quick',
                'modelcontextprotocol',
                'cohere-ai',
                'youbot',
                'mistralai-user',
                'kiroserver',
                'applebot',
                'duckduckbot',
                'duckassistbot',
                'mattermost',
                'webexteams',
                'zohochat',
                'synapse',
                'kakaotalk',
                'line-poker',
                'chrome privacy preserving prefetch proxy',
            ],
            /** WAFv2's RegexString limit, which the script checks before submitting. */
            maxRegexLength: 512,
        },
        /** extend-p11-agent-allowlist.sh: Count only, per IP, scoped to the same UA regex as p11. */
        allowlistedAgentsRate: {
            rule: 'count-allowlisted-agents-rate',
            limit: 600,
            window: 300,
            pending: PENDING.p11AgentAllowlist,
        },
        /** The saliencebot exemption: this UA regex AND this IP set, never either alone. */
        saliencebotUaRegex: 'saliencebot',
        saliencebotIpSet: {
            name: 'salience-bot',
            id: 'e46761ae-d7fe-4207-881e-7297230874a9',
            addresses: ['18.132.26.88/32'],
        } as IpSetExpectation,
        markdownAcceptExemption: 'text/markdown',
        /**
         * Live 2026-10-01: the Accept match lowercases first, so `TEXT/MARKDOWN` is exempt too, although
         * the origin's negotiation is case-sensitive and serves those requests HTML. Declared as-is.
         */
        markdownAcceptTransforms: ['LOWERCASE'],
        safePathRegexes: ['/robots\\.txt$', '/llms\\.txt$', '/sitemap[^/]*\\.xml$', '\\.md$'],
        safePathPrefixes: ['/blog/rss', '/blog/feed'],
        customBody: 'automated-access-blocked',
        /** SE-79: agents fetch this; waf-finding.md §13 says it is not a safe path. */
        shouldBeSafe: ['/.well-known/mcp/server-card.json'],
    },

    rateRules: [
        { name: 'soft-rate-limit-docs-with-captch-count', limit: 500, window: 300, assetScopeDown: true },
        { name: 'soft-rate-limit-rule-with-captcha', limit: 2000, window: 300, assetScopeDown: true, immunity: 3600 },
        {
            name: 'hard-rate-limit-rule-with-blocking',
            limit: 10000,
            window: 300,
            assetScopeDown: true,
            customBody: 'automated-access-blocked',
        },
        // Live 2026-10-01: the flat rule counts every request (no scope-down at all), and the counting
        // rule is AND(p11's non-browser trigger labels, the four safe-path regexes).
        {
            name: 'soft-rate-limit-flat-with-captcha-flat',
            limit: 10000,
            window: 300,
            assetScopeDown: false,
            scopeDown: 'none',
        },
        {
            name: 'count-nonbrowser-safe-paths',
            limit: 300,
            window: 300,
            assetScopeDown: false,
            scopeDown: 'nonbrowser-safe-paths',
        },
    ],
    assetScopeDownRegex:
        '\\.(js|css|mjs|map|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|json|xml|txt|ts|tsx|jsx|gz|mp4|webm|yml|yaml|md)$',
    assetScopeDownPrefixes: ['/_astro/', '/example-assets/'],

    automatedBrowserChallenge: {
        label: 'awswaf:managed:aws:bot-control:signal:automated_browser',
        exemptRegex:
            '\\/api\\/|^\\/blog\\/(rss|feed)|\\.(acc|avi|css|gif|ico|jpe?g|js|json|md|mp[34]|ogg|otf|pdf|png|svg|tiff?|ttf|txt|webm|webp|woff2?|xml)$',
        // The regex is lowercase-only, so without it /image.PNG would be challenged.
        exemptTransforms: ['LOWERCASE'],
        immunity: 3600,
    },

    logging: {
        destination: `arn:aws:logs:us-east-1:${ACCOUNT_ID}:log-group:aws-waf-logs-cloudfront`,
        logGroup: 'aws-waf-logs-cloudfront',
        redactedHeaders: REDACTED_HEADERS,
        redactionPending: PENDING.redactLogs,
    },
};

export const ALB_ACL = {
    name: 'ag-grid-lb1-waf',
    id: '01a29666-9659-4065-aabd-9faee391d612',
    scope: 'REGIONAL',
    region: 'us-west-1',
    defaultAction: 'Allow',
    rules: [
        { name: 'block-non-cloudfront-origin', action: 'Block', metricName: 'block-non-cloudfront-origin' },
        { name: 'AWS-AWSManagedRulesAmazonIpReputationList', action: 'None' },
        { name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet', action: 'None' },
        { name: 'AWS-AWSManagedRulesCommonRuleSet', action: 'None' },
        { name: 'soft-rate-limit-rule-with-captcha', action: 'Captcha', metricName: 'rate-limit-rule' },
        {
            name: 'hard-rate-limit-rule-with-blocking',
            action: 'Block',
            metricName: 'hard-rate-limit-rule-with-blocking',
        },
    ] as RuleExpectation[],
    visibilityMetric: 'ag-grid-lb1-waf',
    onSourceDDoSProtection: { ALBLowReputationMode: 'ACTIVE_UNDER_DDOS' },
    originVerifyHeader: 'x-ag-origin-verify',
    /** Every managed group on the ACL, by rule name (live 2026-10-01). */
    managedGroups: {
        'AWS-AWSManagedRulesAmazonIpReputationList': {
            overrides: [{ name: 'AWSManagedIPDDoSList', action: 'Block' }],
        },
        'AWS-AWSManagedRulesKnownBadInputsRuleSet': { overrides: [] },
        'AWS-AWSManagedRulesCommonRuleSet': { overrides: [] },
    } as Record<string, ManagedGroupExpectation>,
    commonRuleSetExemptPrefix: '/blog/ghost/api/',
    rateLimits: { 'soft-rate-limit-rule-with-captcha': 1000000, 'hard-rate-limit-rule-with-blocking': 100000 },
    /**
     * Both ALB rate rules, as live on 2026-10-01 (read-only get-web-acl). They key on the connection
     * IP with no ForwardedIPConfig, so behind CloudFront they count per edge IP, not per viewer
     * (waf-finding.md §14) - declared as-is, so a change in either direction is drift.
     */
    rateRuleShape: {
        aggregateKeyType: 'IP',
        forwardedIpConfig: null,
        evaluationWindowSec: 300,
        scopeDownExemptPrefix: '/example-assets/',
    },
    logging: {
        destination: `arn:aws:logs:us-west-1:${ACCOUNT_ID}:log-group:aws-waf-logs-prod`,
        logGroup: 'aws-waf-logs-prod',
        redactedHeaders: REDACTED_HEADERS,
        redactionPending: PENDING.redactLogs,
    },
};

/** waf-finding.md §1 fix 5. No value has been chosen, so the expectation is only "it expires". */
export const LOG_RETENTION_PENDING = `${finding(1)} fix 5 (set a retention period) - no script yet`;

// ---------------------------------------------------------------------------------------------
// Origin, alarms, Shield
// ---------------------------------------------------------------------------------------------

export const ALB = {
    name: 'ag-grid-lb1',
    region: 'us-west-1',
    arn: `arn:aws:elasticloadbalancing:us-west-1:${ACCOUNT_ID}:loadbalancer/app/ag-grid-lb1/ddcbf270e7b776cf`,
    metricDimension: 'app/ag-grid-lb1/ddcbf270e7b776cf',
    securityGroup: 'sg-0e00b20ddc86d5a33',
    /** Exactly these ingress rules. Port 22 stays world-open: SSH is the only route to the instances. */
    ingress: [
        { protocol: 'tcp', port: 22, cidrs: ['0.0.0.0/0'], prefixLists: [] as string[] },
        {
            protocol: 'tcp',
            port: 443,
            cidrs: [] as string[],
            prefixLists: ['com.amazonaws.global.cloudfront.origin-facing'],
        },
    ],
    dropInvalidHeaderFields: { expected: 'true', knownIssue: finding(14) },
};

export interface AlarmExpectation extends Lifecycle {
    name: string;
    region: string;
    namespace?: string;
    metric?: string;
    dimensions?: Record<string, string>;
    comparison?: string;
    threshold?: number;
    /** SNS topic name every alarm must notify. */
    topic: string;
}

export const ALARMS: AlarmExpectation[] = [
    {
        name: 'www-traffic-floor',
        region: 'us-east-1',
        comparison: 'LessThanLowerThreshold',
        // Metric-math alarm: anomaly band over CloudFront Requests, checked separately.
        topic: 'aws-global-sns-topic',
    },
    {
        name: 'www-5xx-rate',
        region: 'us-east-1',
        namespace: 'AWS/CloudFront',
        metric: '5xxErrorRate',
        dimensions: { DistributionId: DISTRIBUTION_ID, Region: 'Global' },
        comparison: 'GreaterThanThreshold',
        threshold: 5,
        topic: 'aws-global-sns-topic',
    },
    {
        name: 'www-cert-expiry',
        region: 'us-east-1',
        namespace: 'AWS/CertificateManager',
        metric: 'DaysToExpiry',
        comparison: 'LessThanThreshold',
        threshold: 21,
        topic: 'aws-global-sns-topic',
    },
    {
        name: 'waf-p11-captcha-served',
        region: 'us-east-1',
        namespace: 'AWS/WAFV2',
        metric: 'CaptchaRequests',
        dimensions: { WebACL: 'cloudfront-web-acl', Rule: 'soft-rate-limit-rule-with-captcha' },
        comparison: 'GreaterThanThreshold',
        threshold: 15000,
        topic: 'aws-global-sns-topic',
    },
    {
        name: 'waf-p11-captcha-solved',
        region: 'us-east-1',
        namespace: 'AWS/WAFV2',
        metric: 'RequestsWithValidCaptchaToken',
        dimensions: { WebACL: 'cloudfront-web-acl', Rule: 'soft-rate-limit-rule-with-captcha' },
        comparison: 'GreaterThanThreshold',
        threshold: 0,
        topic: 'aws-global-sns-topic',
    },
    {
        name: 'ag-grid-lb1-unhealthy-host',
        region: 'us-west-1',
        namespace: 'AWS/ApplicationELB',
        metric: 'UnHealthyHostCount',
        dimensions: {
            TargetGroup: 'targetgroup/target-group1/023f2bedf8911b95',
            LoadBalancer: 'app/ag-grid-lb1/ddcbf270e7b776cf',
        },
        comparison: 'GreaterThanOrEqualToThreshold',
        threshold: 1,
        topic: 'ag-website-status',
    },
    {
        name: `DDoSDetectedAlarmForProtection_${DISTRIBUTION_ID}`,
        region: 'us-east-1',
        namespace: 'AWS/DDoSProtection',
        metric: 'DDoSDetected',
        topic: 'aws-global-sns-topic',
        pending: `${finding(14)} (no DDoSDetected alarm on ${DISTRIBUTION_ID}; the other four protected distributions have one) - no script yet`,
    },
];

export const SHIELD = {
    protections: [
        { resource: `arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}`, autoResponse: 'Count' },
        { resource: ALB.arn, autoResponse: 'Count' },
    ],
};

/** CloudWatch health thresholds. These warn, they never fail. */
export const HEALTH = {
    /**
     * ALB requests / CloudFront requests over 24h. Measured 22-32% over 7 days before archive
     * caching (waf-finding.md §8); 40% is a regression signal, not a target.
     */
    maxOriginShare: 0.4,
    /** Days of CloudTrail write history to summarise (overridden by --days). */
    cloudTrailDays: 7,
    certMinDays: 30,
};
