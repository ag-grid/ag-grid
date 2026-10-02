import { type Lifecycle, finding } from './lifecycle';

/**
 * WAF behaviour as seen from the machine running the suite. Low volume by design: one request
 * per row. The block rows rely on this machine NOT being in a datacenter range (Bot Control's
 * datacenter signal would change the outcome) - see the README.
 */
export const UA = {
    curl: 'curl/8.7.1',
    claudeBot:
        'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    claudeUser:
        'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
    gptBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
    metaExternalAgent: 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    perplexityUser:
        'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
    bytespider:
        'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)',
    headlessChrome:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/154.0.0.0 Safari/537.36',
} as const;

export type Expectation =
    /** p11's custom 403 with the guidance body. */
    | 'agent-403'
    /** A WAF block without the custom body (managed groups, p10). */
    | 'generic-403'
    /** The site's own 404 page, not a WAF page. */
    | 'site-404'
    | 'challenge'
    | { status: number; contentType?: string };

export interface WafProbe extends Lifecycle {
    id: string;
    title: string;
    path: string;
    ua?: keyof typeof UA;
    accept?: string;
    expect: Expectation;
    refs: string[];
}

const ok = { status: 200 };

export const WAF_PROBES: WafProbe[] = [
    {
        id: 'curl.doc-page',
        title: 'curl UA on a docs page gets the guidance 403',
        path: '/react-data-grid/getting-started/',
        ua: 'curl',
        expect: 'agent-403',
        refs: ['SE-78', finding(9)],
    },
    {
        id: 'curl.robots',
        title: 'curl UA can read robots.txt',
        path: '/robots.txt',
        ua: 'curl',
        expect: ok,
        refs: ['p11 safe paths', finding(5)],
    },
    {
        id: 'curl.llms',
        title: 'curl UA can read llms.txt',
        path: '/llms.txt',
        ua: 'curl',
        expect: ok,
        refs: ['p11 safe paths', 'SE-79'],
    },
    {
        id: 'curl.sitemap',
        title: 'curl UA can read sitemap-index.xml',
        path: '/sitemap-index.xml',
        ua: 'curl',
        expect: ok,
        refs: ['p11 safe paths', 'SE-186'],
    },
    {
        id: 'curl.md-twin',
        title: 'curl UA can read a .md twin',
        path: '/react-data-grid/getting-started.md',
        ua: 'curl',
        expect: { status: 200, contentType: 'text/markdown' },
        refs: ['p11 safe paths', 'SE-80'],
    },
    {
        id: 'curl.agents-md',
        title: 'curl UA can read AGENTS.md',
        path: '/AGENTS.md',
        ua: 'curl',
        expect: ok,
        refs: ['p11 safe paths', 'SE-79'],
    },
    {
        id: 'curl.rss',
        title: 'curl UA can read the blog RSS feed',
        path: '/blog/rss/',
        ua: 'curl',
        expect: ok,
        refs: ['p11 safe paths', 'SE-90'],
    },
    {
        id: 'curl.markdown-accept',
        title: 'curl UA with Accept: text/markdown gets the markdown page',
        path: '/react-data-grid/getting-started/',
        ua: 'curl',
        accept: 'text/markdown',
        expect: { status: 200, contentType: 'text/markdown' },
        refs: ['SE-80', finding(9)],
    },
    {
        id: 'curl.server-card',
        title: 'curl UA can read the MCP server card',
        path: '/.well-known/mcp/server-card.json',
        ua: 'curl',
        expect: ok,
        refs: ['SE-79', finding(13)],
        knownIssue: `${finding(13)} (server-card.json is not a p11 safe path)`,
    },
    ...['/.env', '/.env.local', '/.git/config', '/id_rsa', '/.ssh/id_rsa', '/.aws/credentials'].map(
        (path): WafProbe => ({
            id: `scanner${path}`,
            title: `${path} is blocked at the edge`,
            path,
            expect: 'generic-403',
            refs: ['SE-185'],
        })
    ),
    {
        id: 'scanner.claude-user-ua',
        title: '/.env is blocked even with a Claude-User UA',
        path: '/.env',
        ua: 'claudeUser',
        expect: 'generic-403',
        refs: ['SE-185'],
    },
    {
        id: 'scanner.not-overblocking',
        title: 'A missing page gets the site 404, not a WAF block',
        path: '/this-page-does-not-exist-edge-check/',
        expect: 'site-404',
        refs: ['SE-185'],
    },
    {
        id: 'ai.claudebot',
        title: 'ClaudeBot UA is served',
        path: '/react-data-grid/getting-started/',
        ua: 'claudeBot',
        expect: ok,
        refs: ['SE-78', 'SE-185'],
    },
    {
        id: 'ai.claude-user',
        title: 'Claude-User UA is served',
        path: '/react-data-grid/getting-started/',
        ua: 'claudeUser',
        expect: ok,
        refs: ['SE-78', 'SE-185'],
    },
    {
        id: 'ai.gptbot',
        title: 'GPTBot UA is served',
        path: '/react-data-grid/getting-started/',
        ua: 'gptBot',
        expect: ok,
        refs: ['SE-78', 'SE-185'],
    },
    {
        id: 'ai.meta-externalagent',
        title: 'meta-externalagent UA is served (robots and the edge agree)',
        path: '/',
        ua: 'metaExternalAgent',
        expect: ok,
        refs: ['SE-184'],
    },
    {
        id: 'ai.meta-externalagent.docs',
        title: 'meta-externalagent UA is served a docs page',
        path: '/react-data-grid/getting-started/',
        ua: 'metaExternalAgent',
        expect: ok,
        refs: ['SE-184'],
    },
    {
        id: 'ai.meta-externalagent.blog',
        title: 'meta-externalagent UA is served the blog',
        path: '/blog/',
        ua: 'metaExternalAgent',
        expect: ok,
        refs: ['SE-184'],
    },
    {
        id: 'ai.perplexity-user',
        title: 'Perplexity-User UA is served',
        path: '/react-data-grid/getting-started/',
        ua: 'perplexityUser',
        expect: ok,
        refs: ['SE-78', finding(6)],
    },
    {
        id: 'ai.bytespider',
        title: 'Bytespider (welcome in the robots AI group) is served',
        path: '/react-data-grid/getting-started/',
        ua: 'bytespider',
        expect: ok,
        refs: ['SE-78', finding(5)],
        knownIssue: `${finding(5)} (robots welcomes Bytespider, the WAF blocks it)`,
    },
    {
        id: 'automated-browser.challenge',
        title: 'HeadlessChrome on a document gets a silent challenge, not a page',
        path: '/react-data-grid/getting-started/',
        ua: 'headlessChrome',
        expect: 'challenge',
        refs: ['challenge-automated-browser-documents', finding(7)],
    },
];

export const AGENT_403_TEXT = 'automated access to this URL is blocked';
