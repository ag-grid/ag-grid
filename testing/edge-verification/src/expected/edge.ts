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
        // add-archive-cache-behaviors.sh copies CachingOptimizedWithHost, adds the markdown split
        // header to the key, and sets MinTTL and DefaultTTL to 0 (archive responses meant to be
        // cached all send s-maxage; a response without Cache-Control stays uncached, and an
        // in-flight no-cache means no-cache). MaxTTL and everything else are the source's.
        name: 'CachingOptimizedWithHostAndMarkdown',
        minTtl: 0,
        defaultTtl: 0,
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

/** Managed-AllViewer forwards every viewer header, cookie and query string (its Comment aside). */
export const ALL_VIEWER_CONFIG = {
    Name: 'Managed-AllViewer',
    HeadersConfig: { HeaderBehavior: 'allViewer' },
    CookiesConfig: { CookieBehavior: 'all' },
    QueryStringsConfig: { QueryStringBehavior: 'all' },
};

/** The distribution's one origin, as every behaviour names it. */
export const ORIGIN_ID = 'ag-grid-lb1-585556639.us-west-1.elb.amazonaws.com-mqnlc8c0eu7';
export const REALTIME_LOG_CONFIG_NAME = 'cf-kinesis-real-time-logs-config';

/**
 * What every behaviour, the default included, has in common (live 2026-10-01): HTTPS redirect,
 * compression, GET and HEAD cached, real-time logs, and the one origin.
 */
const BEHAVIOUR_COMMON: Pick<
    BehaviourExpectation,
    'viewerProtocolPolicy' | 'compress' | 'cachedMethods' | 'realtimeLogConfig'
> = {
    viewerProtocolPolicy: 'redirect-to-https',
    compress: true,
    cachedMethods: ['GET', 'HEAD'],
    realtimeLogConfig: REALTIME_LOG_CONFIG_NAME,
};

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
    cachedMethods: string[];
    viewerProtocolPolicy: 'redirect-to-https' | 'https-only' | 'allow-all';
    compress: boolean;
    /** The real-time log configuration, by name. */
    realtimeLogConfig: string;
    /** Why the behaviour exists - printed when it drifts. */
    why: string;
}

const cachedAsset = (pattern: string, why: string): BehaviourExpectation => ({
    pattern,
    cachePolicy: 'CachingOptimizedWithHost',
    originRequestPolicy: 'Managed-AllViewer',
    viewerRequestFunctions: [],
    allowedMethods: ALL_METHODS,
    ...BEHAVIOUR_COMMON,
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
        ...BEHAVIOUR_COMMON,
        why: 'the /example/ demo page negotiates markdown; must stay ahead of /example/* (2026-09 cache-poisoning incident)',
    },
    {
        pattern: '/example/index.html',
        cachePolicy: 'Managed-CachingDisabled',
        originRequestPolicy: 'Managed-AllViewer',
        viewerRequestFunctions: [],
        allowedMethods: ALL_METHODS,
        ...BEHAVIOUR_COMMON,
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
        ...BEHAVIOUR_COMMON,
        why: 'released grid archives are 58% of origin requests (waf-finding.md §8)',
        pending: PENDING.archiveCache,
    },
    {
        pattern: '/charts/archive/*',
        cachePolicy: 'CachingOptimizedWithHostAndMarkdown',
        originRequestPolicy: 'Managed-AllViewer',
        viewerRequestFunctions: [MARKDOWN_KEY_FUNCTION],
        allowedMethods: ALL_METHODS,
        ...BEHAVIOUR_COMMON,
        why: 'released charts archives (waf-finding.md §8)',
        pending: PENDING.archiveCache,
    },
];

export const DEFAULT_BEHAVIOUR: Omit<BehaviourExpectation, 'pattern' | 'why'> = {
    cachePolicy: 'Managed-CachingDisabled',
    originRequestPolicy: 'Managed-AllViewer',
    viewerRequestFunctions: [],
    allowedMethods: ALL_METHODS,
    ...BEHAVIOUR_COMMON,
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
    priceClass: 'PriceClass_All',
    httpVersion: 'http2',
    ipv6: true,
    minimumProtocolVersion: 'TLSv1.2_2021',
    certificateArn: `arn:aws:acm:us-east-1:${ACCOUNT_ID}:certificate/aa94ddce-6f9e-4072-a887-3f75de1a3fcc`,
    sslSupportMethod: 'sni-only',
    origin: {
        id: ORIGIN_ID,
        domain: 'ag-grid-lb1-585556639.us-west-1.elb.amazonaws.com',
        protocolPolicy: 'https-only',
        sslProtocols: ['TLSv1.2'],
        /** Names only; the value is compared with the ALB rule in memory. */
        customHeaderNames: ['x-ag-origin-verify'],
        readTimeout: 30,
        keepaliveTimeout: 5,
        connectionTimeout: 10,
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
    name: REALTIME_LOG_CONFIG_NAME,
    samplingRate: 100,
    /** The Kinesis stream LogLens reads, and the role CloudFront writes to it with. */
    stream: `arn:aws:kinesis:us-west-1:${ACCOUNT_ID}:stream/loglens-www-ag-grid-com`,
    role: `arn:aws:iam::${ACCOUNT_ID}:role/service-role/CloudFrontRealtimeLogConfigRole-cf-kinesis-real-time-logs-config`,
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
    /** Pending rules: the rule this one precedes, for a rule inserted ahead of it. As `after`, mirrored. */
    before?: string;
    /**
     * A later run of the rule's script that changes only its action. Either action passes; a check
     * of its own reports which one is live.
     */
    pendingAction?: { action: WafAction; pending: string };
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
        // Inserted first, ahead of the Allow rules, so no header secret or IP lets a probe past it.
        {
            name: 'block-blog-sqli',
            action: 'Count',
            metricName: 'blockBlogSqli',
            before: 'allow-trusted-mcp-lambda',
            pending: PENDING.blogSqliCount,
            pendingAction: { action: 'Block', pending: PENDING.blogSqliBlock },
        },
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

    /**
     * add-blog-sqli-rule.sh: SQL injection in the path, query string, user agent and body of
     * requests to the Ghost blog, the body not on Ghost's authenticated admin API. The path is
     * matched decoded and normalised, as Apache's ProxyPass /blog/ sees it; the values are decoded
     * once, as Ghost reads them. A plain Block once switched: the agent 403 body does not fit.
     */
    blogSqli: {
        prefix: '/blog/',
        prefixTransforms: ['URL_DECODE', 'NORMALIZE_PATH'],
        bodyExemptPrefix: '/blog/ghost/api/admin/',
        userAgentHeader: 'user-agent',
        transforms: ['URL_DECODE', 'HTML_ENTITY_DECODE'],
        sensitivity: 'LOW',
        bodyOversize: 'CONTINUE',
    },

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
    /**
     * The paths on which block-datacenter-except-agent-paths honours Accept: text/markdown: the
     * origin's own negotiation conditions (grid docs and hubs; other grid pages; charts; studio),
     * live or archived, matched on the raw UriPath with NONE. Verbatim from
     * move-datacenter-block-after-agent-exemptions.sh (NEGOTIABLE_PATHS); the grid two are held to
     * the docs page registry by wafNegotiablePaths.test.ts.
     */
    dataCentreMarkdownPaths: [
        String.raw`^/(archive/[0-9]+\.[0-9]+\.[0-9]+/)?(((react|angular|vue|javascript)-data-grid/[^/.]+|(react|angular|vue)-data-grid)/?)?$`,
        String.raw`^/(archive/[0-9]+\.[0-9]+\.[0-9]+/)?(about|changelog|documentation-archive|example|license-pricing|pipeline|roadmap|whats-new|community(/(beyond-the-prompt|events|media|showcase|tools-extensions))?|session/[^/.]+|campaigns/bryntum-[^/.]+|landing-pages/[^/.]+|react-table|cookies|eula/(commercial|community)|modern-slavery|privacy|terms-of-use|example-(finance|hr|inventory)|contact|niall|licensing|reference|sitemap|theme-builder)/?$`,
        String.raw`^/charts(/archive/[0-9]+\.[0-9]+\.[0-9]+)?(/((react|angular|vue|javascript)/[^/.]+|(react|angular|vue)|changelog|contact|documentation-archive|license-pricing|pipeline|roadmap|sitemap|whats-new|community(/(beyond-the-prompt|events|media|showcase|tools-extensions))?|session/[^/.]+|examples(-[^/.]+)?|gallery(/[^/.]+)?|(angular|enterprise|javascript|react|vue)-charts|options(/(axes|series|initialState/annotations|navigator/miniChart/series)/[^/.]+)?|themes-api(/overrides/[^/.]+)?))?/?$`,
        String.raw`^/studio(/archive/[0-9]+\.[0-9]+\.[0-9]+)?(/((react|angular|vue|javascript)/[^/.]+|documentation-archive|example|license-pricing|roadmap|community(/(beyond-the-prompt|events|media|showcase|tools-extensions))?|session/[^/.]+|example-(embedded-analytics|widget-library)|licensing|sitemap|theme-builder|campaigns/launch-week))?/?$`,
    ],
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
        /**
         * tighten-p11-markdown-exemption.sh (opt-in, not yet approved): the bare Accept exemption
         * becomes AND(it, OR(dataCentreMarkdownPaths)) in place.
         */
        markdownScopedPending: PENDING.p11MarkdownScoped,
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
    /** describe-load-balancers, live 2026-10-01 (name, ARN, DNS name and creation time aside). */
    loadBalancer: {
        Scheme: 'internet-facing',
        VpcId: 'vpc-37efa553',
        State: { Code: 'active' },
        Type: 'application',
        AvailabilityZones: [
            { ZoneName: 'us-west-1a', SubnetId: 'subnet-cf141197', LoadBalancerAddresses: [] },
            { ZoneName: 'us-west-1b', SubnetId: 'subnet-8e12e7e9', LoadBalancerAddresses: [] },
        ],
        SecurityGroups: ['sg-0e00b20ddc86d5a33'],
        IpAddressType: 'ipv4',
        EnablePrefixForIpv6SourceNat: 'off',
    },
    /**
     * Every load-balancer attribute, live 2026-10-01, except drop_invalid_header_fields (a known
     * issue with its own check). waf.fail_open in particular: true would pass traffic the WAF
     * cannot evaluate.
     */
    attributes: {
        'access_logs.s3.enabled': 'true',
        'access_logs.s3.bucket': 'ag-grid-logs',
        'access_logs.s3.prefix': '',
        'health_check_logs.s3.enabled': 'false',
        'health_check_logs.s3.bucket': '',
        'health_check_logs.s3.prefix': '',
        'idle_timeout.timeout_seconds': '60',
        'deletion_protection.enabled': 'true',
        'routing.http2.enabled': 'true',
        'routing.http.xff_client_port.enabled': 'false',
        'routing.http.preserve_host_header.enabled': 'false',
        'routing.http.xff_header_processing.mode': 'append',
        'load_balancing.cross_zone.enabled': 'true',
        'routing.http.desync_mitigation_mode': 'defensive',
        'client_keep_alive.seconds': '3600',
        'waf.fail_open.enabled': 'false',
        'routing.http.x_amzn_tls_version_and_cipher_suite.enabled': 'false',
        'ddos_protection.syn_cookie.mode': 'reactive',
        'zonal_shift.config.enabled': 'false',
        'connection_logs.s3.enabled': 'false',
        'connection_logs.s3.bucket': '',
        'connection_logs.s3.prefix': '',
    } as Record<string, string>,
};

export interface AlarmExpectation extends Lifecycle {
    name: string;
    region: string;
    /** A single-metric alarm's metric. A metric-math alarm declares `metrics` instead. */
    namespace?: string;
    metric?: string;
    statistic?: string;
    /** The complete set: CloudWatch names a metric by all its dimensions. */
    dimensions?: Record<string, string>;
    period?: number;
    /** A metric-math alarm's queries, dimensions as a record, and the id of the one it compares with. */
    metrics?: unknown[];
    thresholdMetricId?: string;
    evaluationPeriods: number;
    /** Left out where the alarm has none (it then alarms on every evaluation period). */
    datapointsToAlarm?: number;
    comparison: string;
    threshold?: number;
    treatMissingData: 'breaching' | 'notBreaching' | 'ignore' | 'missing';
    /** SNS topic name every alarm must notify. */
    topic: string;
    /** Whether the return to OK notifies the topic as well. */
    notifyOk: boolean;
    /**
     * A pending script disables the alarm's actions and changes nothing else. Enabled or disabled,
     * the alarm passes; a check of its own reports which is live.
     */
    pendingActionsDisabled?: string;
}

/** Every alarm as describe-alarms returns it, live 2026-10-01 (descriptions and state aside). */
export const ALARMS: AlarmExpectation[] = [
    {
        name: 'www-traffic-floor',
        region: 'us-east-1',
        // An anomaly band, 3 standard deviations wide, over the distribution's 5-minute request count.
        metrics: [
            {
                Id: 'm1',
                MetricStat: {
                    Metric: {
                        Namespace: 'AWS/CloudFront',
                        MetricName: 'Requests',
                        Dimensions: { DistributionId: DISTRIBUTION_ID, Region: 'Global' },
                    },
                    Period: 300,
                    Stat: 'Sum',
                },
                ReturnData: true,
            },
            { Id: 'ad1', Expression: 'ANOMALY_DETECTION_BAND(m1, 3)', ReturnData: true },
        ],
        thresholdMetricId: 'ad1',
        evaluationPeriods: 3,
        datapointsToAlarm: 3,
        comparison: 'LessThanLowerThreshold',
        // A total outage produces no datapoints at all.
        treatMissingData: 'breaching',
        topic: 'aws-global-sns-topic',
        notifyOk: true,
    },
    {
        name: 'www-5xx-rate',
        region: 'us-east-1',
        namespace: 'AWS/CloudFront',
        metric: '5xxErrorRate',
        statistic: 'Average',
        dimensions: { DistributionId: DISTRIBUTION_ID, Region: 'Global' },
        period: 300,
        evaluationPeriods: 2,
        datapointsToAlarm: 2,
        comparison: 'GreaterThanThreshold',
        threshold: 5,
        treatMissingData: 'notBreaching',
        topic: 'aws-global-sns-topic',
        notifyOk: true,
    },
    {
        name: 'www-cert-expiry',
        region: 'us-east-1',
        namespace: 'AWS/CertificateManager',
        metric: 'DaysToExpiry',
        statistic: 'Minimum',
        dimensions: { CertificateArn: DISTRIBUTION.certificateArn },
        period: 21600,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
        comparison: 'LessThanThreshold',
        threshold: 21,
        treatMissingData: 'breaching',
        topic: 'aws-global-sns-topic',
        notifyOk: true,
    },
    {
        name: 'waf-p11-captcha-served',
        region: 'us-east-1',
        namespace: 'AWS/WAFV2',
        metric: 'CaptchaRequests',
        statistic: 'Sum',
        dimensions: { WebACL: 'cloudfront-web-acl', Rule: 'soft-rate-limit-rule-with-captcha' },
        period: 300,
        evaluationPeriods: 1,
        comparison: 'GreaterThanThreshold',
        threshold: 15000,
        treatMissingData: 'notBreaching',
        topic: 'aws-global-sns-topic',
        notifyOk: false,
        // Only scanners have tripped it; it stays as a graph, and waf-p11-captcha-solved alerts.
        pendingActionsDisabled: PENDING.captchaServedSilenced,
    },
    {
        name: 'waf-p11-captcha-solved',
        region: 'us-east-1',
        namespace: 'AWS/WAFV2',
        metric: 'RequestsWithValidCaptchaToken',
        statistic: 'Sum',
        dimensions: { WebACL: 'cloudfront-web-acl', Rule: 'soft-rate-limit-rule-with-captcha' },
        period: 300,
        evaluationPeriods: 1,
        comparison: 'GreaterThanThreshold',
        threshold: 0,
        treatMissingData: 'notBreaching',
        topic: 'aws-global-sns-topic',
        notifyOk: false,
    },
    {
        name: 'ag-grid-lb1-unhealthy-host',
        region: 'us-west-1',
        namespace: 'AWS/ApplicationELB',
        metric: 'UnHealthyHostCount',
        statistic: 'Maximum',
        dimensions: {
            TargetGroup: 'targetgroup/target-group1/023f2bedf8911b95',
            LoadBalancer: 'app/ag-grid-lb1/ddcbf270e7b776cf',
        },
        period: 60,
        evaluationPeriods: 3,
        datapointsToAlarm: 3,
        comparison: 'GreaterThanOrEqualToThreshold',
        threshold: 1,
        treatMissingData: 'notBreaching',
        topic: 'ag-website-status',
        notifyOk: true,
    },
    {
        // Declared as Shield Advanced created it for the other four protected distributions (live 2026-10-01).
        name: `DDoSDetectedAlarmForProtection_${DISTRIBUTION_ID}`,
        region: 'us-east-1',
        namespace: 'AWS/DDoSProtection',
        metric: 'DDoSDetected',
        statistic: 'Sum',
        dimensions: { ResourceArn: `arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}` },
        period: 60,
        evaluationPeriods: 20,
        datapointsToAlarm: 1,
        comparison: 'GreaterThanOrEqualToThreshold',
        threshold: 1,
        treatMissingData: 'notBreaching',
        topic: 'aws-global-sns-topic',
        notifyOk: false,
        pending: `${finding(14)} (no DDoSDetected alarm on ${DISTRIBUTION_ID}; the other four protected distributions have one) - no script yet`,
    },
];

export const SHIELD = {
    /** Without it the subscription lapses at its end date. */
    autoRenew: 'ENABLED',
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
