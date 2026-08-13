import type { InternalFramework } from '@ag-grid-types';
import { NPM_CDN } from '@constants';

import { getImportMap } from './getImportMap';

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3'];

const EXAMPLE_VARIANTS = [
    { isEnterprise: false, isIntegratedCharts: false },
    { isEnterprise: true, isIntegratedCharts: false },
    { isEnterprise: false, isIntegratedCharts: true },
];

/** AG packages, as opposed to the third-party framework entries, which have their own CDNs */
const isAgPackage = (specifier: string) => specifier.startsWith('ag-') || specifier.startsWith('@ag-grid-community/');

/** Strips any subpath, so that `ag-grid-community/styles/` gives the package it belongs to */
const getPackageName = (specifier: string) =>
    specifier
        .split('/')
        .slice(0, specifier.startsWith('@') ? 2 : 1)
        .join('/');

/**
 * `.env.build.production` sets `PUBLIC_USE_PUBLISHED_PACKAGES`, which `@constants` reads at module
 * scope, so the modules have to be re-evaluated with it in place to see what production emits.
 * `PUBLIC_BASE_URL` is stubbed alongside it because branch builds set it, and a path prefix must
 * never end up in a published-packages import map.
 */
const getProductionImportMap = async (args: {
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts: boolean;
}) => {
    vi.stubEnv('PUBLIC_USE_PUBLISHED_PACKAGES', 'true');
    vi.stubEnv('PUBLIC_BASE_URL', '/AG-17103/');
    vi.stubEnv('PUBLIC_SITE_URL', 'https://testing.ag-grid.com');
    vi.resetModules();

    const { getImportMap: getProductionMap } = await import('./getImportMap');
    return getProductionMap(args);
};

describe('getImportMap', () => {
    describe.each(FRAMEWORKS)('%s', (internalFramework) => {
        test('resolves the grid, its stylesheets and the framework wrapper', () => {
            const importMap = getImportMap({ internalFramework, isEnterprise: false });

            expect(importMap['ag-grid-community']).toBeDefined();
            expect(importMap['ag-grid-community/styles/']).toMatch(/\/styles\/$/);

            const wrapper = {
                typescript: undefined,
                vanilla: undefined,
                reactFunctional: 'ag-grid-react',
                reactFunctionalTs: 'ag-grid-react',
                angular: 'ag-grid-angular',
                vue3: 'ag-grid-vue3',
            }[internalFramework];

            if (wrapper) {
                expect(importMap[wrapper]).toBeDefined();
            }
        });
    });

    test('only includes the charts packages for enterprise examples', () => {
        const community = getImportMap({ internalFramework: 'typescript', isEnterprise: false });
        const enterprise = getImportMap({ internalFramework: 'typescript', isEnterprise: true });

        expect(community['ag-charts-community']).toBeUndefined();
        expect(enterprise['ag-charts-community']).toBeDefined();

        // Resolvable either way, for the generator's test-id block
        expect(community['ag-grid-enterprise']).toBeDefined();
    });

    /**
     * The production site is built against published packages, so its examples must load AG Grid
     * from the npm CDN and never from the site that served them -- a `localhost`, staging or
     * branch-prefixed URL here would leave a published example unable to load, and the same import
     * map is what the Plunker and CodeSandbox exports carry (see `ExampleModules`).
     */
    describe('built against published packages', () => {
        afterEach(() => {
            vi.unstubAllEnvs();
            vi.resetModules();
        });

        describe.each(FRAMEWORKS)('%s', (internalFramework) => {
            test.each(EXAMPLE_VARIANTS)('resolves every AG package from the npm CDN (%o)', async (variant) => {
                const importMap = await getProductionImportMap({ internalFramework, ...variant });
                const agEntries = Object.entries(importMap).filter(([specifier]) => isAgPackage(specifier));

                expect(agEntries.length).toBeGreaterThan(0);
                for (const [specifier, url] of agEntries) {
                    // Every entry is versioned, including the trailing-slash stylesheet prefixes,
                    // whose specifier is a subpath of the package rather than the package itself
                    const cdnPrefix = `${NPM_CDN}/${getPackageName(specifier)}@`;
                    expect(url.startsWith(cdnPrefix), `${specifier} -> ${url}`).toBe(true);
                }
            });

            test.each(EXAMPLE_VARIANTS)('resolves nothing from the site serving it (%o)', async (variant) => {
                const importMap = await getProductionImportMap({ internalFramework, ...variant });

                for (const [specifier, url] of Object.entries(importMap)) {
                    expect(url, specifier).toMatch(/^https:\/\//);
                    // A port only ever appears on a local or preview host
                    expect(url, specifier).not.toMatch(/^https:\/\/[^/]+:\d+/);
                    expect(url, specifier).not.toContain('localhost');
                    expect(url, specifier).not.toContain('ag-grid.com');
                    // The branch path prefix stubbed above, which must not leak into the URLs
                    expect(url, specifier).not.toContain('AG-17103');
                }
            });
        });

        test('is what makes the AG packages resolve to the CDN', async () => {
            // Guards the tests above against passing because the CDN is used unconditionally
            const local = getImportMap({ internalFramework: 'typescript', isEnterprise: true });

            expect(local['ag-grid-community']).not.toContain(NPM_CDN);
        });
    });
});
