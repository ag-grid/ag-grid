import type { InternalFramework } from '@ag-grid-types';
import { NPM_CDN } from '@constants';
import { FRAMEWORK_VERSION_PLACEHOLDER } from '@utils/exampleModules/getImportMap';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { EXAMPLE_RUNNER_SCRIPT_FILE_NAME } from './ExampleRunnerClient';

const FRAMEWORKS: InternalFramework[] = ['typescript', 'reactFunctionalTs', 'angular', 'vue3'];

const SITE_URL = 'https://site.example';
const BASE_URL = '/base/';

const EXAMPLE_FILE_NAMES = ['index.html', 'main.ts', 'useFetchJson.tsx', 'styles.css'];

const CLIENT_PATH = `../../../../../public/example-runner/${EXAMPLE_RUNNER_SCRIPT_FILE_NAME}`;

const callArgs = (html: string, fn: string) => {
    const call = html.match(new RegExp(`agExampleRunner\\.${fn}\\((.*)\\);`));
    if (!call) {
        throw new Error(`No ${fn} call rendered in:\n${html}`);
    }

    return JSON.parse(`[${call[1].replaceAll('&quot;', '"')}]`);
};

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

    return await registerImportMap(callArgs(html, 'injectImportMap')[0]);
};

const registerImportMap = async (options: Record<string, unknown>) => {
    const registered: any[] = [];

    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('document', {
        createElement: () => ({}) as any,
        head: { appendChild: (element: any) => registered.push(element) },
        body: { appendChild: () => undefined },
    });

    try {
        const client = readFileSync(join(__dirname, CLIENT_PATH), 'utf8');
        new Function(client)();
        (globalThis as any).window.agExampleRunner.injectImportMap(options);
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

        test('loads the client once, before the example is loaded', async () => {
            const html = await renderMarkup({ internalFramework });

            const client = html.indexOf(EXAMPLE_RUNNER_SCRIPT_FILE_NAME);
            const entryModule = html.indexOf('type="module"');

            expect(html.match(new RegExp(EXAMPLE_RUNNER_SCRIPT_FILE_NAME, 'g'))).toHaveLength(1);
            expect(client).toBeGreaterThan(-1);
            expect(client).toBeLessThan(entryModule);
        });

        test('serves the client from the site in the runner, so that fixes reach every page', async () => {
            const html = await renderMarkup({ internalFramework });

            expect(html).toContain(`src="${SITE_URL}${BASE_URL}example-runner/${EXAMPLE_RUNNER_SCRIPT_FILE_NAME}"`);
        });

        test('loads the client from the exported project, so that a saved export keeps working', async () => {
            const html = await renderMarkup({ internalFramework, transpileInBrowser: true });

            expect(html).toContain(`src="./${EXAMPLE_RUNNER_SCRIPT_FILE_NAME}"`);
            expect(html).not.toContain(`example-runner/${EXAMPLE_RUNNER_SCRIPT_FILE_NAME}`);
        });

        test('resolves the import map in the exported page, rather than leaving it to the injector', async () => {
            const html = await renderMarkup({ internalFramework, transpileInBrowser: true });

            expect(html).toContain('type="importmap"');
            expect(html).not.toContain('injectImportMap');
            expect(html).not.toContain(FRAMEWORK_VERSION_PLACEHOLDER);
        });

        test('sets the page up before the example is loaded', async () => {
            const html = await renderMarkup({ internalFramework });

            const setUp = html.indexOf('setUpPage');
            const entryModule = html.indexOf('type="module"');

            expect(setUp).toBeGreaterThan(-1);
            expect(setUp).toBeLessThan(entryModule);
        });

        test("names the example's own modules to the in-browser transpiler, and nothing else", async () => {
            const html = await renderMarkup({ internalFramework, transpileInBrowser: true });

            expect(callArgs(html, 'runTranspiled')[0].moduleFiles).toEqual(['main.ts', 'useFetchJson.tsx']);
        });

        test('hands the seeded generator its seed, for an example that generates its own', async () => {
            const html = await renderMarkup({ internalFramework, usesMathRandom: true });

            expect(callArgs(html, 'seedRandom')[0]).toBeTruthy();
        });

        test('carries no logic of its own beyond the calls into the client', async () => {
            const html = await renderMarkup({ internalFramework, usesMathRandom: true });

            const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
            const machinery = inline.filter(
                ([, attributes, body]) => !attributes.includes('importmap') && !body.includes('agExampleRunner.')
            );

            expect(machinery.map(([, , body]) => body)).toEqual([]);
        });
    });
});
