import { type ConsumedSitemapRecord, decideSecondBuild } from './consumedSitemapRecord';

const HOME = 'https://www.ag-grid.com/';
const ABOUT = 'https://www.ag-grid.com/about/';
const PIPELINE = 'https://www.ag-grid.com/pipeline/';

const sitemapXml = (...locs: string[]) =>
    `<?xml version="1.0" encoding="UTF-8"?><urlset>${locs
        .map((loc) => `<url><loc>${loc}</loc><lastmod>2026-08-21T00:00:00.000Z</lastmod></url>`)
        .join('')}</urlset>`;

const cacheRecord = (...locs: string[]): ConsumedSitemapRecord => ({ source: 'cache', locs });
const liveRecord = (...locs: string[]): ConsumedSitemapRecord => ({
    source: 'live',
    sitemapUrl: 'https://www.ag-grid.com/sitemap-0.xml',
    locs,
});

describe('decideSecondBuild', () => {
    test('skips the second build when the generated sitemap lists the pages already rendered', () => {
        const decision = decideSecondBuild({
            generatedXml: sitemapXml(HOME, ABOUT),
            record: cacheRecord(HOME, ABOUT),
        });

        expect(decision).toEqual({ needed: false, reason: 'sitemap unchanged since the cached sitemap — 2 page(s)' });
    });

    test('skips the second build when the live sitemap the page rendered from is still current', () => {
        const decision = decideSecondBuild({
            generatedXml: sitemapXml(HOME, ABOUT),
            record: liveRecord(HOME, ABOUT),
        });

        expect(decision.needed).toBe(false);
        expect(decision.reason).toContain('the live sitemap (https://www.ag-grid.com/sitemap-0.xml)');
    });

    test('builds again when a page was added', () => {
        const decision = decideSecondBuild({
            generatedXml: sitemapXml(HOME, ABOUT, PIPELINE),
            record: cacheRecord(HOME, ABOUT),
        });

        expect(decision).toEqual({ needed: true, reason: `1 added (${PIPELINE})` });
    });

    test('builds again when the first build had no sitemap to render from', () => {
        const decision = decideSecondBuild({ generatedXml: sitemapXml(HOME), record: null });

        expect(decision.needed).toBe(true);
    });

    test('skips the second build when this build generates no sitemap at all', () => {
        // Archive builds: the sitemap integrations are not registered and the /sitemap page is
        // removed from the output, so no amount of rebuilding can change it.
        const decision = decideSecondBuild({ generatedXml: null, record: null });

        expect(decision.needed).toBe(false);
    });
});
