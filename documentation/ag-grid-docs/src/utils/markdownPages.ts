// Type-only import: erased at runtime, so this module stays loadable under plain node (the
// htaccess test harness runs it through `tsx`, where the shared subrepo resolves as CJS).
import type { MarkdownPageGroup } from '../../../../external/ag-website-shared/src/markdown-pages/markdownPageRegistry';
import { FRAMEWORKS } from '../constants';

/**
 * SE-80: every AG Grid page that ships a markdown (`.md`) twin, declared once.
 *
 * Derives the dev-server negotiation patterns, the Apache rewrite rule and the Apache
 * `Vary: Accept` scope — see `@ag-website-shared/markdown-pages/markdownPageRegistry` for
 * the pattern-syntax constraints (the patterns are compiled by both JavaScript and PCRE).
 *
 * The invariant this list serves: **every URL in the sitemap has a `.md` twin**. That is
 * enforced by the post-build check in `markdownPages.test.ts`, so a new page added without
 * a twin fails the build rather than silently 404ing for agents. Pages excluded from the
 * sitemap (example runners, `debug/*`, redirect stubs' framework variants, `contact/success`)
 * are correspondingly absent here.
 *
 * Imported by the dev-server Vite plugin, which is bundled with `astro.config.mjs` and so
 * resolves without tsconfig path aliases — hence the relative import above.
 */
export const GRID_MARKDOWN_PAGE_GROUPS: MarkdownPageGroup[] = [
    {
        describes: 'The homepage. Negotiated by a dedicated rule: its twin is index.md, not <path>.md.',
    },
    {
        describes: 'Every docs page, once per framework — the bulk of the twins (~365 pages x 4).',
        pattern: `(?:${FRAMEWORKS.join('|')})-data-grid/[^/.]+`,
    },
    {
        describes: 'Top-level content pages.',
        pattern: 'about|changelog|documentation-archive|example|license-pricing|pipeline|roadmap|whats-new',
    },
    {
        describes: 'The community landing page and its subpages.',
        pattern: 'community(?:/(?:beyond-the-prompt|events|media|showcase|tools-extensions))?',
    },
    {
        describes: 'Beyond the Prompt conference session recordings.',
        pattern: 'session/[^/.]+',
    },
    {
        describes: 'Bryntum partner campaign pages.',
        pattern: 'campaigns/bryntum-[^/.]+',
    },
    {
        describes: 'SEO landing pages, all rendered from the landingPages collection.',
        pattern: 'landing-pages/[^/.]+|react-table',
    },
    {
        // /privacy/your-choice is deliberately absent: it is a post-submission confirmation page,
        // disallowed in robots.txt and excluded from the sitemap, like the /contact result pages.
        describes: 'Legal and policy pages.',
        pattern: 'cookies|modern-slavery|privacy',
    },
    {
        describes: 'Standalone demo applications.',
        pattern: 'example-(?:finance|hr|inventory)',
    },
    {
        describes: 'Company pages.',
        pattern: 'contact|niall',
    },
    {
        describes: 'Framework redirect stubs and interactive tools.',
        pattern: 'licensing|reference|sitemap|theme-builder',
    },
];

function patternedGroups(): string[] {
    return GRID_MARKDOWN_PAGE_GROUPS.map((group) => group.pattern).filter(
        (pattern): pattern is string => pattern != null && pattern.length > 0
    );
}

/**
 * Alternation fragment for embedding in an anchored Apache regex, e.g. `^/(<alternation>)/?$`.
 * Returned without an enclosing group so the caller controls whether the match is captured
 * (`RewriteCond` needs `%1`; the `Vary` `<If>` does not).
 */
export function markdownPathAlternation(): string {
    return patternedGroups().join('|');
}

/**
 * Anchored JavaScript regexes, one per group, for the dev-server negotiation plugin. A trailing
 * slash is optional so both `/about` and `/about/` negotiate.
 */
export function markdownPathPatterns(): RegExp[] {
    return patternedGroups().map((pattern) => new RegExp(`^/(?:${pattern})/?$`));
}
