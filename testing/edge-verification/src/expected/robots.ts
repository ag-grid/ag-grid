import { type Lifecycle, NEW_FINDING, PENDING, finding } from './lifecycle';

/** SE-78 / SE-184: the named AI-crawler group, exactly. */
export const AI_GROUP = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'Bytespider',
    'Meta-ExternalAgent',
];

export const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=yes';
export const SITEMAP = 'https://www.ag-grid.com/sitemap-index.xml';

/** SE-89: the Ghost-internal disallows, in both groups. */
export const GHOST_DISALLOWS = [
    '/blog/ghost/',
    '/blog/email/',
    '/blog/members/api/',
    '/blog/r/',
    '/blog/webmentions/receive/',
    '/blog/.ghost/analytics/api/',
];

/**
 * How each AI-group token gets past the WAF (robots and the edge must agree, SE-184):
 * - 'ua-regex': p11's UA allowlist (checked against the live regex);
 * - 'token-only': a permission token, not a crawler - never sends requests (Google-Extended,
 *   Applebot-Extended);
 * - a knownIssue: admitted by robots, not by the edge.
 */
export const AI_TOKEN_ADMISSION: Record<string, { via: 'ua-regex' | 'token-only' } & Lifecycle> = {
    GPTBot: { via: 'ua-regex' },
    'OAI-SearchBot': { via: 'ua-regex' },
    'ChatGPT-User': { via: 'ua-regex' },
    ClaudeBot: { via: 'ua-regex' },
    'Claude-User': { via: 'ua-regex' },
    'Claude-SearchBot': { via: 'ua-regex' },
    PerplexityBot: { via: 'ua-regex' },
    'Perplexity-User': {
        via: 'ua-regex',
        knownIssue: `${finding(6)} (not in the p11 regex; passes only because its UA is not labelled non-browser)`,
        fixedBy: PENDING.p11AgentAllowlist,
    },
    'Google-Extended': { via: 'token-only' },
    'Applebot-Extended': { via: 'token-only' },
    CCBot: { via: 'ua-regex' },
    Bytespider: {
        via: 'ua-regex',
        knownIssue: `${finding(5)} (blocked by Bot Control before p11, and not in the p11 regex)`,
    },
    'Meta-ExternalAgent': { via: 'ua-regex' },
};

/** Tokens that obey the `*` group, and tokens in the AI group, for the URL matrix. */
export const STAR_TOKENS = ['Googlebot', 'Bingbot', 'Amazonbot', 'Applebot', 'DuckDuckBot'];
export const AI_TOKENS = ['GPTBot', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'CCBot', 'Meta-ExternalAgent'];

export interface RobotsRow extends Lifecycle {
    url: string;
    /** Allowed for the `*` group (search crawlers)? */
    star: boolean;
    /** Allowed for the named AI group? */
    ai: boolean;
    refs: string[];
}

const both = (url: string, allowed: boolean, refs: string[], extra: Partial<RobotsRow> = {}): RobotsRow => ({
    url,
    star: allowed,
    ai: allowed,
    refs,
    ...extra,
});

export const ROBOTS_MATRIX: RobotsRow[] = [
    both('/', true, ['SE-78']),
    both('/react-data-grid/getting-started/', true, ['SE-78']),
    both('/react-data-grid/getting-started.md', true, ['SE-80']),
    both('/charts/react/quick-start/', true, ['SE-78']),
    both('/studio/javascript/quick-start/', true, ['SE-78']),
    both('/blog/whats-new-in-ag-grid-36-1/', true, ['SE-89']),
    both('/blog/tag/angular/', true, ['SE-89'], {}),
    both('/blog/ghost/api/admin/', false, ['SE-89']),
    both('/blog/members/api/comments/counts/', false, ['SE-89']),
    both('/debug/anything/', false, ['SE-78']),
    { url: '/examples/anything/', star: false, ai: true, refs: ['SE-78', 'SE-182'] },
    { url: '/charts/react/bar-series/examples/basic/', star: false, ai: true, refs: ['SE-78'] },
    both('/charts/react/benchmarks/', false, ['SE-78']),
    both('/charts/react/selection-test/', false, ['SE-182']),
    both('/charts/demos/', true, ['SE-182']),
    both('/studio/react/autosave-test/', false, ['SE-78']),
    both('/react-data-grid/cell-editing-batch-test/', false, ['SE-78']),
    both('/react-data-grid/cell-editing-batch-test.md', false, [finding(11), 'grid#15424'], {
        knownIssue: `${finding(11)} (Disallow lines end with /, so .md copies of disallowed pages stay crawlable)`,
        fixedBy: PENDING.gridRobotsTwins,
    }),
    both('/studio/react/autosave-test.md', false, [finding(11), 'grid#15424'], {
        knownIssue: `${finding(11)} (the studio *-test pages' .md twins stay crawlable)`,
        fixedBy: `${PENDING.gridRobotsTwins}, or ag-studio#3087 e6cd2ef86 (the published disallow list)`,
    }),
    both('/charts/react/selection-test.md', false, [finding(11), 'grid#15424'], {
        knownIssue: `${finding(11)} (the charts hidden pages' .md twins stay crawlable)`,
        fixedBy: `${PENDING.gridRobotsTwins}, or ag-charts#8432 119ed88dc6 (the published disallow list)`,
    }),
    both('/changelog/?searchQuery=test', false, ['SE-183']),
    both('/pipeline/?searchQuery=test', false, ['SE-183']),
    both('/changelog/', true, ['SE-183']),
    both('/campaigns/bryntum-gantt/', true, ['SE-78']),
    both('/campaigns/some-other-campaign/', false, ['SE-78']),
    both('/privacy/your-choice/', false, ['SE-78']),
    // SE-182: versioned archives closed to search, open to the AI group (RTI-3476, intentional).
    { url: '/archive/36.2.0/react-data-grid/getting-started/', star: false, ai: true, refs: ['SE-182', finding(12)] },
    { url: '/charts/archive/11.2.0/', star: false, ai: true, refs: ['SE-182', finding(12)] },
    { url: '/studio/archive/1.0.0/', star: false, ai: true, refs: ['SE-182', finding(12)] },
    // SE-182 / waf-finding.md §12: the archive roots should be crawlable so their 301 is visible.
    both('/archive/', true, ['SE-182', finding(12), 'grid#15424'], { pending: PENDING.gridRobotsTwins }),
    both('/charts/archive/', true, ['SE-182', finding(12), 'grid#15424'], { pending: PENDING.gridRobotsTwins }),
    // ...and only the roots: Allow: /archive/$ must not open the archived pages to search.
    { url: '/archive/36.2.0/', star: false, ai: true, refs: ['SE-182', 'grid#15424'] },
    { url: '/charts/archive/14.2.0/', star: false, ai: true, refs: ['SE-182', 'grid#15424'] },
];

/** Every robots.txt the site serves. */
export const ROBOTS_FILES = {
    charts: 'https://www.ag-grid.com/charts/robots.txt',
    studio: 'https://www.ag-grid.com/studio/robots.txt',
    chartsHost: 'https://charts.ag-grid.com/robots.txt',
};

/**
 * grid#15424 pairs every directory rule with an exact `<page>.md$` rule. Evaluated over every
 * directory Disallow in the live robots.txt (the page classes come from the charts and studio
 * builds, so they are not listed here), for the group that disallows the page.
 */
export const MD_TWIN_POLICY = {
    /** A product token per group, to evaluate the group's verdict. */
    groupTokens: { '*': 'Googlebot', ai: 'GPTBot' },
    /** Substituted for each `*` in a pattern, to build a concrete URL. */
    wildcardSample: 'edge-check',
    query: '?utm_source=edge-check',
    pending: PENDING.gridRobotsTwins,
    /** The `$` on `<page>.md$` means a query string reopens the twin. */
    queryKnownIssue: NEW_FINDING(
        'grid#15424 emits <page>.md$ twin rules; the $ anchor leaves <page>.md?<query> crawlable for every disallowed page'
    ),
};
