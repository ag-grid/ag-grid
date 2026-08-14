import type { InternalFramework } from '@ag-grid-types';
import { NPM_CDN } from '@constants';
import { IMPORT_MAP_OPTIONS_ID } from '@utils/exampleModules/getImportMap';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctionalTs', 'angular', 'vue3'];

/** The injector as it is served, so the test registers the map the way the page does */
const INJECTOR_PATH = '../../../../../public/example-runner/inject-import-map.js';

/**
 * The example runner, the Plunker page and the static CodeSandbox page all render this component,
 * so what it emits is what each of them ships. `transpileInBrowser` is the only thing
 * that differs between them: Plunker and the static CodeSandbox template are handed the sources as
 * authored, the runner is served them transpiled.
 */
const renderMarkup = async ({
    internalFramework,
    transpileInBrowser,
    usesMathRandom,
}: {
    internalFramework: InternalFramework;
    transpileInBrowser?: boolean;
    usesMathRandom?: boolean;
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
            usesMathRandom={usesMathRandom}
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
        currentScript: null,
        getElementById: (id: string) => (id === IMPORT_MAP_OPTIONS_ID ? { textContent: optionsJson } : null),
        createElement: () => ({}) as any,
        head: { appendChild: (element: any) => registered.push(element) },
        body: { appendChild: () => undefined },
    });

    try {
        const injector = readFileSync(join(__dirname, INJECTOR_PATH), 'utf8');
        new Function(injector)();
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

        test('serves the page boilerplate once, before the example is loaded', async () => {
            const html = await renderMarkup({ internalFramework });

            const boilerplate = html.indexOf('/example-runner/example-page.js');
            const entryModule = html.indexOf('type="module"');

            expect(html.match(/example-page\.js/g)).toHaveLength(1);
            expect(boilerplate).toBeGreaterThan(-1);
            expect(boilerplate).toBeLessThan(entryModule);
        });

        test('serves the boilerplate from the site rather than inlining it', async () => {
            const html = await renderMarkup({ internalFramework });

            // The frameworkless examples have no version to resolve from the URL, so their map
            // is served as markup and there is no injector to load
            const served = ['example-page.js', ...(internalFramework === 'typescript' ? [] : ['inject-import-map.js'])];

            for (const fileName of served) {
                expect(html).toContain(`src="https://testing.ag-grid.com/AG-17103/example-runner/${fileName}"`);
            }
        });

        test('hands the seeded generator its seed as data, for an example that generates its own', async () => {
            const html = await renderMarkup({ internalFramework, usesMathRandom: true });

            expect(html).toContain('/example-runner/seed-random.js');
            expect(html).toMatch(/seed-random\.js"[^>]*data-seed="[^"]+"/);
        });

        test('carries no script body of its own beyond the data the served scripts read', async () => {
            const html = await renderMarkup({ internalFramework, usesMathRandom: true });

            // Every inline script is either the base-path assignment the templates emit or a
            // JSON block; anything else is machinery that belongs in a served file
            const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
            const machinery = inline.filter(
                ([, attributes, body]) =>
                    !attributes.includes('application/json') &&
                    !attributes.includes('importmap') &&
                    !body.includes('__basePath')
            );

            expect(machinery.map(([, , body]) => body)).toEqual([]);
        });
    });
});
