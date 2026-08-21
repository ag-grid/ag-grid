import { BUILD_USER_AGENT } from '@ag-website-shared/constants';
import { SITE_URL } from '@constants';

import { pathJoin } from './pathJoin';
import { urlWithBaseUrl } from './urlWithBaseUrl';

export const disallowAllRobotsTxt = () => 'User-agent: *\nDisallow: /';

/**
 * AI-crawler position (SE-78): allow everything — AI search, AI answers and model training — and
 * go one step further by opening the example pages to AI even though they stay closed to search.
 *
 * The Content-Signal states the position explicitly on every group rather than leaving it to the
 * default: `search=yes` (may index for search), `ai-input=yes` (an AI assistant may use the page
 * when answering a user — this is what keeps AG Grid citable in AI answers) and `ai-train=yes`
 * (may be used to train models).
 *
 * Two groups are emitted:
 * - `User-agent: *` keeps the full Disallow list, including the example paths. Search engines
 *   (Googlebot, Bingbot, …) match this group, so examples stay out of search — they are
 *   duplicate/low-value for SEO.
 * - A named AI group repeats the same rules but WITHOUT the public example Disallows, so the AI
 *   crawlers may read the examples we want them to train on. Internal `/debug/` example fixtures are
 *   kept blocked (they are dev/build artefacts, not real content). This is the one case where naming
 *   the bots is correct: they genuinely need different rules from the wildcard. robots.txt groups do
 *   not inherit, so the AI group is generated from the same allow/disallow arrays as the wildcard
 *   (minus the public examples) — there is no second, hand-maintained copy to drift out of sync.
 *
 * Googlebot is never named, so it falls through to `User-agent: *` and keeps examples blocked.
 * `Google-Extended` (Gemini/Vertex training, a separate token) is in the AI group; Google states
 * it does not affect Search inclusion or ranking.
 */
const AI_CONTENT_SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=yes';

// Major AI crawlers — training and answer/search — that AG Grid actively welcomes, including onto
// the example pages. Every one gets the same tailored group (all rules except the example blocks).
export const AI_CRAWLERS = [
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

// Public example pages we actively want AI to crawl and train on. Internal `/debug/` example
// fixtures (e.g. /charts/debug/docs-example-files) are dev/build artefacts, not real example
// content, so they are NOT opened — they stay blocked for AI just as they are for search.
const isAiOpenExamplePath = (path: string) => /example/i.test(path) && !path.includes('/debug/');

/**
 * SE-89: the self-hosted Ghost blog is reverse-proxied under /blog/, so its robots rules have to
 * live in the main site's robots.txt — a crawler only ever reads /robots.txt at the domain root, and
 * Ghost's own /blog/robots.txt is never fetched.
 *
 * These are Ghost's internal endpoints, prefixed for the proxy. They are the blog's original
 * disallow list and nothing more.
 *
 * Deliberately NOT here:
 * - No blanket `Disallow: /blog/`. Blocking a path hides the 301s on it from Google, which is the
 *   opposite of what the migration needs — the old URLs redirect here and those redirects have to be
 *   crawlable to transfer anything.
 * - No disallow on the post, tag or author paths. Tags that stay noindexed do so with a page-level
 *   meta tag (SE-25), and that only works while Google can still crawl the page to read it. A robots
 *   block would hide the noindex, not enforce it.
 *
 * These apply to the AI groups as well as the wildcard: `isAiOpenExamplePath` only relaxes example
 * paths, so admin and API endpoints stay blocked for every agent.
 */
const BLOG_DISALLOW_PATHS = [
    '/blog/ghost/',
    '/blog/email/',
    '/blog/members/api/',
    '/blog/r/',
    '/blog/webmentions/receive/',
    '/blog/.ghost/analytics/api/',
];

const buildGroup = (userAgents: string[], allowPaths: string[], disallowPaths: string[]) =>
    [
        ...userAgents.map((userAgent) => `User-agent: ${userAgent}`),
        AI_CONTENT_SIGNAL,
        `Allow: ${urlWithBaseUrl('/')}`,
        `Allow: ${urlWithBaseUrl('/charts/')}`,
        `Allow: ${urlWithBaseUrl('/studio/')}`,
        // SE-89: explicit, matching /charts/ and /studio/. The blanket `Allow: /` above already
        // covers it; stating it makes the intent unmissable to anyone reading the file, since the
        // migration depends on /blog/ staying crawlable.
        `Allow: ${urlWithBaseUrl('/blog/')}`,
        ...allowPaths.map((path) => `Allow: ${path}`),
        ...disallowPaths.map((path) => `Disallow: ${path}`),
        // After the Allow lines: robots.txt precedence is longest-match, not document order, so
        // `Disallow: /blog/ghost/` beats `Allow: /blog/` regardless of position.
        ...BLOG_DISALLOW_PATHS.map((path) => `Disallow: ${urlWithBaseUrl(path)}`),
    ].join('\n');

export const productionRobotsTxt = (allowPaths: string[] = [], disallowPaths: string[] = []) => {
    const wildcardGroup = buildGroup(['*'], allowPaths, disallowPaths);
    // AI crawlers are welcome on the public example pages, so drop those Disallows for them only —
    // every other rule (debug, test, archive, 404, internal /debug/ example fixtures, …) still applies.
    const aiDisallowPaths = disallowPaths.filter((path) => !isAiOpenExamplePath(path));
    const aiGroup = buildGroup(AI_CRAWLERS, allowPaths, aiDisallowPaths);

    return `${wildcardGroup}

${aiGroup}

Sitemap: ${pathJoin(SITE_URL, urlWithBaseUrl('/sitemap-index.xml'))}
`;
};

export const fetchRobotsDisallow = async (urls: string[]) => {
    const fetches = urls.map((url) =>
        fetch(url, { headers: { 'User-Agent': BUILD_USER_AGENT } })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                return response.json();
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(`Error fetching ${url}:`, error);
                throw error;
            })
    );

    const results = await Promise.all(fetches);

    return results.flat();
};
