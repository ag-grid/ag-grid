import type { InternalFramework } from '@ag-grid-types';
import { NPM_CDN } from '@constants';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctionalTs', 'angular', 'vue3'];

/**
 * The example runner, the Plunker page and the static CodeSandbox page all render this component,
 * so the import map it emits is what each of them ships. `transpileInBrowser` is the only thing
 * that differs between them: Plunker and the static CodeSandbox template are handed the sources as
 * authored, the runner is served them transpiled.
 */
const renderImportMap = async ({
    internalFramework,
    transpileInBrowser,
}: {
    internalFramework: InternalFramework;
    transpileInBrowser?: boolean;
}) => {
    // `.env.build.production` sets `PUBLIC_USE_PUBLISHED_PACKAGES`, which `@constants` reads at
    // module scope, so the modules have to be re-evaluated with it in place
    vi.stubEnv('PUBLIC_USE_PUBLISHED_PACKAGES', 'true');
    vi.stubEnv('PUBLIC_BASE_URL', '/AG-17103/');
    vi.stubEnv('PUBLIC_SITE_URL', 'https://testing.ag-grid.com');
    vi.resetModules();

    const { ExampleModules } = await import('./ExampleModules');
    const html = renderToStaticMarkup(
        <ExampleModules
            appLocation="/examples/column-groups/basic-grouping/typescript/"
            entryFileName="main.ts"
            internalFramework={internalFramework}
            isEnterprise
            isIntegratedCharts
            transpileInBrowser={transpileInBrowser}
        />
    );

    const importMap = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
    if (!importMap) {
        throw new Error(`No import map rendered in:\n${html}`);
    }

    return JSON.parse(importMap[1].replace(/&quot;/g, '"')).imports as Record<string, string>;
};

describe('ExampleModules', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    describe.each(FRAMEWORKS)('%s', (internalFramework) => {
        test('emits an import map resolving AG packages from the npm CDN when built against published packages', async () => {
            const imports = await renderImportMap({ internalFramework });
            const agEntries = Object.entries(imports).filter(
                ([specifier]) => specifier.startsWith('ag-') || specifier.startsWith('@ag-grid-community/')
            );

            expect(agEntries.length).toBeGreaterThan(0);
            for (const [specifier, url] of agEntries) {
                expect(url.startsWith(`${NPM_CDN}/`), `${specifier} -> ${url}`).toBe(true);
            }
        });

        test('emits the same import map for the Plunker and CodeSandbox exports as for the runner', async () => {
            const runner = await renderImportMap({ internalFramework });
            const exported = await renderImportMap({ internalFramework, transpileInBrowser: true });

            expect(exported).toEqual(runner);
        });
    });
});
