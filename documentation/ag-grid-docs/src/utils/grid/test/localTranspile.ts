import type { Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import ts from 'typescript';

/**
 * The example runner transpiles TypeScript in the browser, which costs every test a 3.3MB download of
 * `typescript.min.js` plus the compile itself - the same work, repeated once per test, in the slowest
 * place to do it. Emitting `System.register` here instead gives SystemJS a format it loads natively, so
 * it never asks for the compiler. This is a test-harness shortcut only: the shipped site is unchanged
 * and still demonstrates the in-browser path.
 */
const TRANSPILED_MODULE = /\.(ts|tsx|jsx)$/;

const EXAMPLES_PREFIX = '/examples/';

/**
 * Mirrors the `typescriptOptions` each boilerplate passes to plugin-typescript, so output matches - down to
 * the source map, which that plugin defaults on. Inlined because the map is served from a route rather than
 * a file the browser could fetch alongside it, and with sources so a failure still points at the example's
 * own TypeScript.
 */
function compilerOptionsFor(framework: string): ts.CompilerOptions {
    const base: ts.CompilerOptions = {
        module: ts.ModuleKind.System,
        target: ts.ScriptTarget.ES2020,
        inlineSourceMap: true,
        inlineSources: true,
    };
    if (framework === 'angular') {
        return { ...base, experimentalDecorators: true, emitDecoratorMetadata: true };
    }
    if (framework.startsWith('reactFunctional')) {
        return { ...base, jsx: ts.JsxEmit.React };
    }
    return base;
}

/** Framework decides the compiler options, and it is the segment before the file name. */
function frameworkFor(pathname: string): string {
    const segments = pathname.split('/');
    return segments[segments.length - 2] ?? '';
}

/**
 * The test-id block the generator injects imports the enterprise bundle to resolve names from `?modules=`,
 * and nothing else uses it. Without that parameter the branch is dead, so a community example was parsing
 * 2.6MB of unminified enterprise for nothing. An example that is genuinely enterprise imports it itself and
 * is unaffected.
 */
const INJECTED_ENTERPRISE_IMPORT = /^import \* as agGridEnterprise from 'ag-grid-enterprise';$\n/m;

function withoutUnusedEnterprise(source: string): string {
    return source.replace(INJECTED_ENTERPRISE_IMPORT, '').replace('agGridEnterprise[name]', 'undefined');
}

/** Keyed on the source itself, so an edit mid-run recompiles rather than serving the previous build. */
const transpiled = new Map<string, string>();

function transpile(source: string, fileName: string, framework: string): string {
    const key = createHash('sha1').update(framework).update(source).digest('hex');
    let output = transpiled.get(key);
    if (output === undefined) {
        output = ts.transpileModule(source, { fileName, compilerOptions: compilerOptionsFor(framework) }).outputText;
        transpiled.set(key, output);
    }
    return output;
}

/**
 * SystemJS 0.19 predates ES modules, so it hands any it meets to the same in-browser compiler. Angular and
 * Vue ship as ESM, which is why those examples still fetched it once their own sources arrived compiled.
 */
const ESM_BUNDLE = /\/fesm20\d\d\/|\.esm-browser\.js$|\.mjs$/;

/** ESNext because only the module wrapper needs changing - downlevelling a framework build would not. */
const ESM_TO_SYSTEM: ts.CompilerOptions = { module: ts.ModuleKind.System, target: ts.ScriptTarget.ESNext };

const transpileEsm = (source: string): string =>
    ts.transpileModule(source, { compilerOptions: ESM_TO_SYSTEM }).outputText;

/** Bumped when the emit changes, so cached bundles from an older converter are not reused. */
const CONVERTER = 'v1';

/** Every test reloads the same framework bundles, so a worker resolves each one once and reuses it. */
const converted = new Map<string, Promise<Buffer>>();

/**
 * Megabyte bundles cost a few hundred milliseconds each to convert, so the result lives beside its mirror
 * entry: the sweep that ages out the entry reclaims this too, and only the first run of all pays for it.
 */
async function convertBundle(path: string, body: Buffer): Promise<Buffer> {
    const cached = await readFile(path).catch(() => undefined);
    if (cached) {
        return cached;
    }
    const output = Buffer.from(transpileEsm(body.toString('utf8')));
    // Same publish-by-rename as the mirror: workers convert concurrently and must not read a partial file.
    const tmp = `${path}.${process.pid}.tmp`;
    await writeFile(tmp, output)
        .then(() => rename(tmp, path))
        .catch(() => undefined);
    return output;
}

export function systemRegisterFor(url: string, mirrorPath: string, body: Buffer): Promise<Buffer> | undefined {
    if (!ESM_BUNDLE.test(new URL(url).pathname)) {
        return undefined;
    }
    const path = `${mirrorPath}.${CONVERTER}.system`;
    let pending = converted.get(path);
    if (!pending) {
        pending = convertBundle(path, body);
        converted.set(path, pending);
    }
    return pending;
}

/**
 * Compiles what the browser would otherwise compile: the example's own modules, and the framework wrappers
 * the site serves from its own origin. `ag-grid-angular` ships as fesm2022, and that one file was enough to
 * pull in the whole compiler - the mirror's conversion only covers third-party bundles.
 */
export async function routeExampleModulesTranspiled(page: Page, siteOrigin: string): Promise<void> {
    const isExampleModule = (pathname: string): boolean =>
        pathname.startsWith(EXAMPLES_PREFIX) && TRANSPILED_MODULE.test(pathname);

    await page.route(
        (url) => url.origin === siteOrigin && (isExampleModule(url.pathname) || ESM_BUNDLE.test(url.pathname)),
        async (route) => {
            const { pathname } = new URL(route.request().url());
            const response = await route.fetch();
            if (!response.ok()) {
                await route.fulfill({ response });
                return;
            }
            const raw = await response.text();
            if (!isExampleModule(pathname)) {
                await route.fulfill({ contentType: 'application/javascript', body: transpileEsm(raw) });
                return;
            }
            // The page has already navigated, so its query says whether the enterprise import will be used.
            const needsEnterprise = new URL(page.url()).searchParams.has('modules');
            const source = needsEnterprise ? raw : withoutUnusedEnterprise(raw);
            const body = transpile(source, pathname.split('/').pop()!, frameworkFor(pathname));
            await route.fulfill({ contentType: 'application/javascript', body });
        }
    );
}
