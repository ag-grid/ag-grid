import type { InternalFramework } from '@ag-grid-types';
import { NPM_CDN } from '@constants';
import { FRAMEWORK_VERSION_PLACEHOLDER, IMPORT_MAP_OPTIONS_ID } from '@utils/exampleModules/getImportMap';

import { TRANSPILER_OPTIONS_ID } from './BrowserTranspiler';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctionalTs', 'angular', 'vue3'];

const SITE_URL = 'https://site.example';
const BASE_URL = '/base/';

const EXAMPLE_FILE_NAMES = ['index.html', 'main.ts', 'useFetchJson.tsx', 'styles.css'];

const INJECTOR_PATH = '../../../../../public/example-runner/inject-import-map.js';

const renderMarkup = async ({
    internalFramework,
    transpileInBrowser,
    usesMathRandom,
    fileNames = EXAMPLE_FILE_NAMES,
}: {
    internalFramework: InternalFramework;
    transpileInBrowser?: boolean;
    usesMathRandom?: boolean;
    fileNames?: string[];
}) => {
    vi.stubEnv('PUBLIC_USE_PUBLISHED_PACKAGES', 'true');
    vi.stubEnv('PUBLIC_BASE_URL', BASE_URL);
    vi.stubEnv('PUBLIC_SITE_URL', SITE_URL);
    vi.resetModules();

    const { ExampleModules } = await import('./ExampleModules');
    const html = renderToStaticMarkup(
        <ExampleModules
            appLocation="/examples/column-groups/basic-grouping/typescript/"
            entryFileName="main.ts"
            fileNames={fileNames}
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

    const options = html.match(new RegExp(`<script[^>]*id="${IMPORT_MAP_OPTIONS_ID}"[^>]*>([\\s\\S]*?)</script>`));
    if (!options) {
        throw new Error(`No import map rendered in:\n${html}`);
    }

    return await registerImportMap(options[1].replace(/&quot;/g, '"'));
};

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

            const served = ['example-page.js', ...(internalFramework === 'typescript' ? [] : ['inject-import-map.js'])];

            for (const fileName of served) {
                expect(html).toContain(`src="${SITE_URL}${BASE_URL}example-runner/${fileName}"`);
            }
        });

        test('resolves the import map in the exported page, rather than leaving it to the injector', async () => {
            const html = await renderMarkup({ internalFramework, transpileInBrowser: true });

            expect(html).toContain('type="importmap"');
            expect(html).not.toContain('inject-import-map.js');
            expect(html).not.toContain(FRAMEWORK_VERSION_PLACEHOLDER);
        });

        test('defines `process.env` in the exported page, before the example reads it', async () => {
            const html = await renderMarkup({ internalFramework, transpileInBrowser: true });

            const shim = html.indexOf('window.process');
            const entryModule = html.indexOf('type="module"');

            expect(shim).toBeGreaterThan(-1);
            expect(shim).toBeLessThan(entryModule);
        });

        test('leaves `process.env` to the served boilerplate in the runner', async () => {
            const html = await renderMarkup({ internalFramework });

            expect(html).not.toContain('window.process');
        });

        test('names the example\'s own modules to the in-browser transpiler, and nothing else', async () => {
            const html = await renderMarkup({ internalFramework, transpileInBrowser: true });

            const options = html.match(new RegExp(`id="${TRANSPILER_OPTIONS_ID}"[^>]*>([\\s\\S]*?)</script>`));

            expect(JSON.parse(options![1].replace(/&quot;/g, '"')).moduleFiles).toEqual([
                'main.ts',
                'useFetchJson.tsx',
            ]);
        });

        test('hands the seeded generator its seed as data, for an example that generates its own', async () => {
            const html = await renderMarkup({ internalFramework, usesMathRandom: true });

            expect(html).toContain('/example-runner/seed-random.js');
            expect(html).toMatch(/seed-random\.js"[^>]*data-seed="[^"]+"/);
        });

        test('carries no script body of its own beyond the data the served scripts read', async () => {
            const html = await renderMarkup({ internalFramework, usesMathRandom: true });

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
