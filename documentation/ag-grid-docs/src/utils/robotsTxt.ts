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

const buildGroup = (userAgents: string[], allowPaths: string[], disallowPaths: string[]) =>
    [
        ...userAgents.map((userAgent) => `User-agent: ${userAgent}`),
        AI_CONTENT_SIGNAL,
        `Allow: ${urlWithBaseUrl('/')}`,
        `Allow: ${urlWithBaseUrl('/charts/')}`,
        `Allow: ${urlWithBaseUrl('/studio/')}`,
        ...allowPaths.map((path) => `Allow: ${path}`),
        ...disallowPaths.map((path) => `Disallow: ${path}`),
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
