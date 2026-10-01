import type * as Constants from '../constants';

// AG-17157 / SE-24: archived docs must never compete with the current docs in search. The layout
// emits <meta name="robots" content="noindex"> whenever getIsArchive() or !getIsProduction() holds
// (src/layouts/Layout.astro), and astro.config.mjs drops the sitemap for archive builds; both key
// off these two functions, so this is where a regression would start.
describe('env', () => {
    const load = async (siteUrl: string | undefined, baseUrl: string) => {
        vi.resetModules();
        vi.doMock('../constants', async (importActual) => {
            const actual = await importActual<typeof Constants>();
            return { ...actual, SITE_URL: siteUrl, SITE_BASE_URL: baseUrl };
        });
        return import('./env');
    };

    afterEach(() => {
        vi.doUnmock('../constants');
        vi.resetModules();
    });

    it.each([
        ['https://www.ag-grid.com', '/archive/36.2.0/', true, true],
        ['https://ag-grid.com', '/archive/32.3.9/', true, true],
        ['https://www.ag-grid.com', '/', true, false],
        ['https://grid-staging.ag-grid.com', '/archive/36.2.0/', false, false],
        ['https://grid-staging.ag-grid.com', '/', false, false],
        ['http://localhost:4610', '/', false, false],
    ])('%s%s: production=%s, archive=%s', async (siteUrl, baseUrl, production, archive) => {
        const env = await load(siteUrl, baseUrl);
        expect(env.getIsProduction()).toBe(production);
        expect(env.getIsArchive()).toBe(archive);
    });
});
