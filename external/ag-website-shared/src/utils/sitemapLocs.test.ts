import { describeSitemapLocsDiff, diffSitemapLocs, getSitemapLocs } from './sitemapLocs';

const sitemapXml = (...locs: string[]) =>
    `<?xml version="1.0" encoding="UTF-8"?><urlset>${locs
        .map((loc) => `<url><loc>${loc}</loc><lastmod>2026-08-21T00:00:00.000Z</lastmod></url>`)
        .join('')}</urlset>`;

const HOME = 'https://www.ag-grid.com/';
const ABOUT = 'https://www.ag-grid.com/about/';
const PIPELINE = 'https://www.ag-grid.com/pipeline/';

describe('getSitemapLocs', () => {
    test('reads the locs in sitemap order', () => {
        expect(getSitemapLocs(sitemapXml(HOME, ABOUT))).toEqual([HOME, ABOUT]);
    });

    test('returns nothing for a sitemap with no urls', () => {
        expect(getSitemapLocs(sitemapXml())).toEqual([]);
    });
});

describe('diffSitemapLocs', () => {
    test('matches sitemaps whose lastmod differs but whose pages do not', () => {
        const before = getSitemapLocs(sitemapXml(HOME, ABOUT));
        const after = getSitemapLocs(sitemapXml(HOME, ABOUT).replace('2026-08-21', '2026-08-22'));

        expect(diffSitemapLocs(before, after).matches).toBe(true);
    });

    test('reports an added page', () => {
        const diff = diffSitemapLocs([HOME, ABOUT], [HOME, ABOUT, PIPELINE]);

        expect(diff).toEqual({ matches: false, added: [PIPELINE], removed: [], reordered: false });
    });

    test('reports a removed page', () => {
        const diff = diffSitemapLocs([HOME, ABOUT, PIPELINE], [HOME, ABOUT]);

        expect(diff).toEqual({ matches: false, added: [], removed: [PIPELINE], reordered: false });
    });

    test('treats a reorder as a change, because the page lists pages in sitemap order', () => {
        const diff = diffSitemapLocs([HOME, ABOUT], [ABOUT, HOME]);

        expect(diff).toEqual({ matches: false, added: [], removed: [], reordered: true });
    });

    test('treats a repeated page as a change, so a duplicate is not lost to set comparison', () => {
        const diff = diffSitemapLocs([HOME], [HOME, HOME]);

        expect(diff).toEqual({ matches: false, added: [], removed: [], reordered: false });
        expect(describeSitemapLocsDiff(diff)).toBe('the page list changed');
    });

    test('does not match an empty sitemap against a populated one', () => {
        expect(diffSitemapLocs([], [HOME]).matches).toBe(false);
    });
});

describe('describeSitemapLocsDiff', () => {
    test('summarises additions and removals', () => {
        const diff = diffSitemapLocs([HOME, ABOUT], [HOME, PIPELINE]);

        expect(describeSitemapLocsDiff(diff)).toBe(`1 added (${PIPELINE}), 1 removed (${ABOUT})`);
    });

    test('truncates a long list of changes', () => {
        const added = ['/a/', '/b/', '/c/', '/d/'];
        const diff = diffSitemapLocs([], added);

        expect(describeSitemapLocsDiff(diff)).toBe('4 added (/a/, /b/, /c/, …)');
    });

    test('calls out a reorder', () => {
        expect(describeSitemapLocsDiff(diffSitemapLocs([HOME, ABOUT], [ABOUT, HOME]))).toBe(
            'same pages in a different order'
        );
    });
});
