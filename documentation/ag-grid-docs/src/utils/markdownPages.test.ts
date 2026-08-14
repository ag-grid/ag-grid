import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { GRID_MARKDOWN_PAGE_GROUPS, markdownPathAlternation, markdownPathPatterns } from './markdownPages';

const DIST = join(__dirname, '../../dist');
const SITEMAP = join(DIST, 'sitemap-0.xml');

const patterns = markdownPathPatterns();
const isNegotiable = (pathname: string) => patterns.some((pattern) => pattern.test(pathname));

describe('GRID_MARKDOWN_PAGE_GROUPS', () => {
    it('produces patterns valid in both JavaScript and Apache PCRE', () => {
        // The alternation is embedded in a RewriteCond and an <If> expression, so it must avoid
        // constructs PCRE lacks or that would break the `m#...#` delimiters.
        const alternation = markdownPathAlternation();
        expect(() => new RegExp(`^/(${alternation})/?$`)).not.toThrow();
        expect(alternation).not.toContain('#');
        expect(alternation).not.toMatch(/\(\?<[=!]/); // lookbehind
        expect(alternation).not.toMatch(/\(\?<[A-Za-z]/); // named groups
    });

    it('never matches a .md URL, so negotiation cannot loop into .md.md', () => {
        expect(isNegotiable('/react-data-grid/cell-editing.md')).toBe(false);
        expect(isNegotiable('/about.md')).toBe(false);
        expect(isNegotiable('/session/opening-keynote.md')).toBe(false);
    });

    it('documents every group, so the registry reads as the list it is', () => {
        for (const group of GRID_MARKDOWN_PAGE_GROUPS) {
            expect(group.describes, JSON.stringify(group)).toBeTruthy();
        }
    });
});

/**
 * The only pages in a built sitemap that deliberately have no twin. All three are `noindex`, so
 * `agSitemapFilterNoindex` drops them from the *production* sitemap — but that integration runs on
 * production hosts only, so a local build still lists them. They are unlisted marketing pages, not
 * documentation, so they are out of scope.
 *
 * Anything else missing a twin is a bug: add the page to GRID_MARKDOWN_PAGE_GROUPS and give it a
 * `.md.ts` endpoint rather than adding it here.
 */
const PAGES_WITHOUT_TWINS = [
    '/campaigns/power-of-ag-charts/',
    '/campaigns/return-to-support/',
    '/community/lets-cook/',
];

function builtSitemapPaths(): string[] {
    if (!existsSync(SITEMAP)) {
        return [];
    }
    return [...readFileSync(SITEMAP, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (match) => new URL(match[1]).pathname
    );
}

// Gate on a *complete* build: an absent dist (a plain unit run) or a half-written one (a build in
// flight) skips rather than fails, since neither says anything about page coverage. The site has
// ~1500 pages, so this threshold cannot be met by a partial build of the non-docs pages alone.
const sitemapPaths = builtSitemapPaths();
const hasCompleteBuild = sitemapPaths.length > 1000;

// The invariant this whole feature rests on: an agent can append `.md` to any URL in the sitemap.
// Requires a build (`nx build ag-grid-docs`); skipped otherwise so unit runs stay fast.
describe.runIf(hasCompleteBuild)('every sitemap URL has a .md twin in dist', () => {
    // Guard against a vacuous pass: if filtering ever empties the set, the assertions below would
    // hold trivially and the check would silently stop protecting anything.
    it('checks a full sitemap', () => {
        expect(sitemapPaths.length).toBeGreaterThan(1000);
    });

    it('emits a .md file next to every page', () => {
        const missing = sitemapPaths.filter((pathname) => {
            const trimmed = pathname.replace(/\/$/, '');
            // The homepage twin is index.md — the root URL has no segment to suffix.
            const twin = trimmed === '' ? 'index.md' : `${trimmed.slice(1)}.md`;
            return !existsSync(join(DIST, twin));
        });
        expect(missing, `${missing.length} sitemap URLs have no .md twin`).toEqual(PAGES_WITHOUT_TWINS);
    });

    it('routes every page with a twin through the negotiation patterns', () => {
        // A twin that exists on disk but is not in the registry would never be served on
        // `Accept: text/markdown`, so the two must agree.
        const unroutable = sitemapPaths.filter(
            (pathname) => pathname !== '/' && !PAGES_WITHOUT_TWINS.includes(pathname) && !isNegotiable(pathname)
        );
        expect(unroutable, `${unroutable.length} pages have a twin but no negotiation rule`).toEqual([]);
    });

    it('keeps the no-twin exclusion list free of stale entries', () => {
        // If one of these pages is removed or gains a twin, the entry must go — otherwise the
        // list quietly grows into a place where real gaps can hide.
        for (const pathname of PAGES_WITHOUT_TWINS) {
            expect(sitemapPaths, `${pathname} is no longer in the sitemap`).toContain(pathname);
        }
    });
});
