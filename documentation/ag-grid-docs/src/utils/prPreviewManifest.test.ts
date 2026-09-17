import type { InternalFramework } from '@ag-grid-types';
import { ALL_INTERNAL_FRAMEWORKS, NPM_CDN } from '@constants';

import {
    type PrPreviewManifest,
    type StagedEntry,
    buildPrPreviewPlan,
    dedupeByContent,
    packageNameOf,
    packageRelativePath,
    previewBaseUrl,
} from './prPreviewManifest';

/**
 * The preview has to carry every file an exported Plunker's import map asks for. These tests read
 * the import map the site actually emits — in published-packages mode, the form a plunk carries —
 * and require each AG entry to resolve through the manifest onto something the preview publishes.
 * A new wrapper entry, or a moved `styles/` tree, fails here rather than as a broken repro link.
 */

const ARGS = { repo: 'ag-grid/ag-grid', pr: 15255, sha: '0123abcdef' } as const;

const VARIANTS = [
    { isEnterprise: false, isIntegratedCharts: false },
    { isEnterprise: true, isIntegratedCharts: false },
    { isEnterprise: false, isIntegratedCharts: true },
] as const;

const publishedMode = async () => {
    vi.stubEnv('PUBLIC_USE_PUBLISHED_PACKAGES', 'true');
    vi.resetModules();
    return {
        getImportMap: (await import('@utils/exampleModules/getImportMap')).getImportMap,
        buildPlan: (await import('./prPreviewManifest')).buildPrPreviewPlan,
    };
};

const isAgSpecifier = (specifier: string) => specifier.startsWith('ag-') || specifier.startsWith('@ag-');

/** The manifest's own longest-prefix lookup, as a consumer of the manifest has to implement it. */
const resolveThroughManifest = (manifest: PrPreviewManifest, packageName: string, relativePath: string) => {
    const paths = manifest.packages[packageName]?.paths;
    if (!paths) {
        return undefined;
    }
    const key = Object.keys(paths)
        .sort((a, b) => b.length - a.length)
        .find((candidate) =>
            candidate.endsWith('/') ? relativePath.startsWith(candidate) : candidate === relativePath
        );
    return key === undefined ? undefined : paths[key] + (key.endsWith('/') ? relativePath.slice(key.length) : '');
};

const isPublished = (entries: StagedEntry[], target: string) =>
    entries.some((entry) => (entry.target.endsWith('/') ? target.startsWith(entry.target) : entry.target === target));

describe('buildPrPreviewPlan', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    test('bases the preview on the repo it was built for', () => {
        expect(previewBaseUrl({ repo: 'ag-grid/ag-grid', pr: 7 })).toBe('https://ag-grid.github.io/ag-grid/pr-7/');
        expect(() => previewBaseUrl({ repo: 'ag-grid', pr: 7 })).toThrow();
    });

    test('publishes both UMD bundles flat at the root, as they have always been', () => {
        const { manifest, entries } = buildPrPreviewPlan(ARGS);

        expect(manifest.umd).toEqual({
            'ag-grid-community': 'ag-grid-community.min.js',
            'ag-grid-enterprise': 'ag-grid-enterprise.min.js',
        });
        for (const filename of Object.values(manifest.umd)) {
            expect(isPublished(entries, filename)).toBe(true);
        }
    });

    test('carries the schema the pin reads', () => {
        const { manifest } = buildPrPreviewPlan(ARGS);

        expect(manifest.version).toBe(1);
        expect(manifest.repo).toBe('ag-grid/ag-grid');
        expect(manifest.pr).toBe(15255);
        expect(manifest.sha).toBe('0123abcdef');
        expect(manifest.base).toBe('https://ag-grid.github.io/ag-grid/pr-15255/');
        expect(Object.keys(manifest.packages)).toContain('ag-grid-community');
    });

    test('publishes only packages this repo builds', () => {
        const { manifest } = buildPrPreviewPlan(ARGS);

        for (const packageName of Object.keys(manifest.packages)) {
            expect(packageName, packageName).not.toMatch(/^ag-charts-/);
            expect(
                packageName === 'ag-stack' ||
                    packageName.startsWith('ag-grid-') ||
                    packageName.startsWith('@ag-grid-community/'),
                packageName
            ).toBe(true);
        }
    });

    test('derives the same manifest whichever mode built the import map', async () => {
        const local = buildPrPreviewPlan(ARGS);
        const { buildPlan } = await publishedMode();

        expect(buildPlan(ARGS).manifest).toEqual(local.manifest);
    });

    describe.each(ALL_INTERNAL_FRAMEWORKS)('%s', (internalFramework: InternalFramework) => {
        test.each(VARIANTS)('every AG import-map value resolves into the preview (%o)', async (variant) => {
            const { getImportMap, buildPlan } = await publishedMode();
            const { manifest, entries } = buildPlan(ARGS);
            const importMap = getImportMap({ internalFramework, ...variant });

            const agEntries = Object.entries(importMap).filter(([specifier]) => isAgSpecifier(specifier));
            expect(agEntries.length).toBeGreaterThan(0);

            for (const [specifier, url] of agEntries) {
                const packageName = packageNameOf(specifier);
                if (packageName.startsWith('ag-charts-')) {
                    // Resolved from node_modules by the site; not built here, so not published.
                    expect(manifest.packages[packageName], specifier).toBeUndefined();
                    continue;
                }

                expect(url, specifier).satisfies((value: string) => value.startsWith(`${NPM_CDN}/${packageName}@`));
                const relativePath = packageRelativePath(packageName, url);
                expect(relativePath, `${specifier} -> ${url}`).toBeDefined();

                const target = resolveThroughManifest(manifest, packageName, relativePath!);
                expect(target, `${specifier} -> ${url}`).toBeDefined();
                expect(isPublished(entries, target!), `${specifier} -> ${target}`).toBe(true);
            }
        });

        test.each(VARIANTS)('leaves every non-AG value alone (%o)', async (variant) => {
            const { getImportMap, buildPlan } = await publishedMode();
            const { manifest } = buildPlan(ARGS);
            const importMap = getImportMap({ internalFramework, ...variant });

            for (const specifier of Object.keys(importMap)) {
                if (!isAgSpecifier(specifier)) {
                    expect(manifest.packages[packageNameOf(specifier)], specifier).toBeUndefined();
                }
            }
        });
    });

    test('names the version the published URLs ask for', async () => {
        const { getImportMap, buildPlan } = await publishedMode();
        const { manifest } = buildPlan(ARGS);
        const importMap = getImportMap({ internalFramework: 'reactFunctionalTs', isEnterprise: true });

        for (const [packageName, { version }] of Object.entries(manifest.packages)) {
            const url = importMap[packageName];
            if (url) {
                expect(url, packageName).satisfies((value: string) =>
                    value.startsWith(`${NPM_CDN}/${packageName}@${version}/`)
                );
            }
        }
    });
});

describe('packageRelativePath', () => {
    test.each([
        ['ag-grid-community', `${NPM_CDN}/ag-grid-community@36.1.0/dist/package/main.esm.mjs`],
        ['ag-grid-community', 'files/ag-grid-community/dist/package/main.esm.mjs'],
        ['ag-grid-community', 'https://ag-grid.com/base/files/ag-grid-community/dist/package/main.esm.mjs'],
    ])('reads the %s path out of %s', (packageName, url) => {
        expect(packageRelativePath(packageName, url)).toBe('dist/package/main.esm.mjs');
    });

    test('keeps a trailing slash, so a prefix stays a prefix', () => {
        expect(packageRelativePath('ag-grid-community', `${NPM_CDN}/ag-grid-community@36.1.0/styles/`)).toBe('styles/');
    });

    test('does not mistake a filename repeating the package name for the package segment', () => {
        expect(packageRelativePath('ag-grid-angular', 'files/ag-grid-angular/fesm2022/ag-grid-angular.mjs')).toBe(
            'fesm2022/ag-grid-angular.mjs'
        );
    });

    test('is undefined when the package does not appear', () => {
        expect(packageRelativePath('ag-grid-community', 'https://esm.sh/react@19.2.1')).toBeUndefined();
    });
});

describe('dedupeByContent', () => {
    test('collapses byte-identical trees onto the first, rewriting paths rather than dropping them', () => {
        const plan = buildPrPreviewPlan(ARGS);
        // `styles/` is the real case: the enterprise package ships a copy of the community tree.
        const deduped = dedupeByContent(plan, (entry) => (entry.target.endsWith('/styles/') ? 'same' : entry.target));

        expect(deduped.manifest.packages['ag-grid-enterprise'].paths['styles/']).toBe('ag-grid-community/styles/');
        expect(deduped.entries.map(({ target }) => target)).not.toContain('ag-grid-enterprise/styles/');
        expect(deduped.entries.map(({ target }) => target)).toContain('ag-grid-community/styles/');
    });

    test('leaves the plan untouched when nothing matches', () => {
        const plan = buildPrPreviewPlan(ARGS);

        expect(dedupeByContent(plan, () => undefined)).toBe(plan);
    });
});
