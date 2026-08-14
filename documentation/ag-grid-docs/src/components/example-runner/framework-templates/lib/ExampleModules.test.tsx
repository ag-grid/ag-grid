import type { InternalFramework } from '@ag-grid-types';
import { NPM_CDN } from '@constants';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { IMPORT_MAP_OPTIONS_ID } from './injectImportMap';

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctionalTs', 'angular', 'vue3'];

/**
 * The example runner, the Plunker page and the static CodeSandbox page all render this component,
 * so what it emits is what each of them ships. `transpileInBrowser` is the only thing
 * that differs between them: Plunker and the static CodeSandbox template are handed the sources as
 * authored, the runner is served them transpiled.
 */
const renderMarkup = async ({
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

    return html;
};

const renderImportMap = async (props: { internalFramework: InternalFramework; transpileInBrowser?: boolean }) => {
    const html = await renderMarkup(props);

    const served = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
    if (served) {
        return JSON.parse(served[1].replace(/&quot;/g, '"')).imports as Record<string, string>;
    }

    // Framework examples register the map in the browser instead, so that the framework version
    // and build can come from the URL -- so run the injector over the options the page carries
    const options = html.match(new RegExp(`<script[^>]*id="${IMPORT_MAP_OPTIONS_ID}"[^>]*>([\\s\\S]*?)</script>`));
    if (!options) {
        throw new Error(`No import map rendered in:\n${html}`);
    }

    return await registerImportMap(options[1].replace(/&quot;/g, '"'));
};

/**
 * Runs the page's own injector over its serialised options, rather than substituting the tokens
 * here, so that what this asserts on is what a browser would resolve. No URL parameters, so it
 * gives the pinned version and the production build -- what a plain example load resolves.
 */
const registerImportMap = async (optionsJson: string) => {
    const registered: any[] = [];

    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('document', {
        createElement: () => ({}) as any,
        head: { appendChild: (element: any) => registered.push(element) },
        body: { appendChild: () => undefined },
    });

    try {
        const { injectImportMap } = await import('./injectImportMap');
        injectImportMap(JSON.parse(optionsJson));
    } finally {
        vi.unstubAllGlobals();
    }

    return JSON.parse(registered[0].textContent).imports as Record<string, string>;
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

        test('emits the page boilerplate once, before the example is loaded', async () => {
            const html = await renderMarkup({ internalFramework });

            const shim = html.indexOf('window.process');
            const entryModule = html.indexOf('type="module"');

            expect(html.match(/window\.process/g)).toHaveLength(1);
            expect(shim).toBeGreaterThan(-1);
            expect(shim).toBeLessThan(entryModule);
        });
    });
});
