/**
 * Guards the invariant that our ESM tree shakes without relying on the consumer's
 * bundler scope-hoisting it.
 *
 * Why this is separate from the Vite-based module size tests: Rollup always
 * scope-hoists within a chunk and emits bare bindings across chunks, so it never
 * produces the `class extends ns.Foo` form that blocks a minifier. Vite therefore
 * cannot detect this class of regression at all — it needs webpack.
 *
 * Each case builds the same entry twice and compares:
 *
 *   concatenateModules: true    the best case, and what Vite/Rollup approximate
 *   concatenateModules: false   what every consumer using splitChunks:{chunks:'all'}
 *                               gets, since webpack will not scope-hoist a module
 *                               referenced across a chunk boundary
 *
 * Two entries are measured because growth has two unrelated causes and a single
 * number cannot tell them apart:
 *
 *   selective    registers 34 modules, so most of ag-grid-enterprise should vanish.
 *                Regressions here mean elimination has started depending on scope
 *                hoisting again.
 *   all modules  registers everything, so nothing is eliminable and all growth is
 *                structural. Regressions here mean we added module boundaries.
 *
 * Both limits are ratchets. Lower them when the underlying number drops.
 */
import fs from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import path from 'path';
import webpack from 'webpack';

const { TestSuites, TestSuite, TestCase } = require('ag-shared/processor');

const isCI = process.env.CI || process.env.NX_TASK_TARGET_CONFIGURATION === 'ci';

// Nested under dist/ so the repo-wide gitignore already covers it.
const outDir = path.resolve(__dirname, 'dist/scope-hoisting');

interface Case {
    readonly name: string;
    readonly entry: string;
    readonly maxGrowthBytes: number;
    readonly rationale: string;
}

const CASES: Case[] = [
    {
        name: 'selective module registration',
        entry: 'scope-hoisting/entry.mjs',
        /**
         * Measured at 51.8 KiB over a 1529 KiB baseline. Around 43 KiB of that is
         * structural (see the all-modules case) and only ~8 KiB is dead code we have
         * not managed to shed, so there is little left to win here.
         *
         * The regression this catches was 704 KiB on a comparable baseline, back when
         * enterprise shipped as a single bundled ESM file: a minifier cannot prove
         * `class extends ns.BeanStub` pure, and our feature classes reference each
         * other in cycles, so retaining one retained its whole subsystem.
         */
        maxGrowthBytes: 70 * 1024,
        rationale:
            'Elimination of unregistered features has started depending on the consumer bundler\n' +
            'scope-hoisting our ESM, which webpack will not do for a module in a separate chunk —\n' +
            'the configuration most applications use. The usual cause is ag-grid-enterprise\n' +
            'reverting to a single bundled ESM file; see esbuild-plugin-multi-file-esm.cjs.',
    },
    {
        name: 'all modules registered',
        entry: 'scope-hoisting/entryAllModules.mjs',
        /**
         * Measured at 72.8 KiB over a 2429 KiB baseline, across 615 webpack modules.
         * Emitting enterprise as multi-file ESM is what creates most of this: it costs
         * ~84 bytes per module to buy back roughly 166 KiB of dead code in the
         * selective case, which is a trade worth making but not a free one.
         */
        maxGrowthBytes: 90 * 1024,
        rationale:
            'Structural overhead has grown: more webpack modules, more export getter blocks,\n' +
            'or more cross-module references. Nothing here is dead code, so this is the cost of\n' +
            'module granularity rather than a tree-shaking failure. Check whether a package that\n' +
            'was shipping bundled ESM has been split into more files than it needs.',
    },
];

function bundleDirFor(entry: string, concatenateModules: boolean): string {
    return path.join(outDir, path.basename(entry, '.mjs'), concatenateModules ? 'concat' : 'noconcat');
}

function bundlePath(entry: string, concatenateModules: boolean): string {
    return path.join(bundleDirFor(entry, concatenateModules), 'bundle.js');
}

function buildOnce(entry: string, concatenateModules: boolean): Promise<number> {
    const bundleDir = bundleDirFor(entry, concatenateModules);
    return new Promise((resolve, reject) => {
        webpack(
            {
                mode: 'production',
                entry: path.resolve(__dirname, entry),
                output: {
                    path: bundleDir,
                    filename: 'bundle.js',
                    clean: true,
                },
                resolve: { extensions: ['.js', '.mjs'] },
                devtool: false,
                performance: { hints: false },
                optimization: {
                    minimize: true,
                    usedExports: true,
                    sideEffects: true,
                    innerGraph: true,
                    providedExports: true,
                    splitChunks: false,
                    runtimeChunk: false,
                    // The single variable under test.
                    concatenateModules,
                },
                stats: 'errors-only',
            },
            (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (stats?.hasErrors()) {
                    reject(new Error(stats.toString({ preset: 'errors-only' })));
                    return;
                }
                resolve(fs.statSync(path.join(bundleDir, 'bundle.js')).size);
            }
        );
    });
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KiB`;

/** Rows in the entry points, so the API assertion has something to compare against. */
const EXPECTED_ROWS = 3;

/**
 * Runs a built bundle in jsdom and reports what the grid did.
 *
 * Size is blind to the failures multi-file ESM can introduce — a module the build
 * dropped, a specifier left unresolvable, a top-level initialiser reading a binding
 * from a circular import before it is assigned. All of those still produce a bundle
 * of a plausible size; they only show up when it runs.
 *
 * Assertions go through the grid API rather than the DOM: jsdom performs no layout,
 * so element heights are zero and row virtualisation would render nothing regardless
 * of whether the grid is healthy. `getDisplayedRowCount()` exercises the row model
 * end to end, which is the thing worth proving.
 */
async function runBundle(bundlePath: string): Promise<{ rowCount: number; columnCount: number; rendered: boolean }> {
    // Drop the grid's own console output — the unlicensed-trial banner is six lines per
    // run — while collecting the errors jsdom raises asynchronously, which a thrown
    // exception from `eval` would not cover. Collected rather than logged: a bundle that
    // creates the API and then throws during scheduled work would otherwise satisfy every
    // assertion below and pass.
    const jsdomErrors: Error[] = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (e: Error) => jsdomErrors.push(e));

    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
        runScripts: 'outside-only',
        pretendToBeVisual: true,
        virtualConsole,
    });

    dom.window.eval(fs.readFileSync(bundlePath, 'utf-8'));

    // `pretendToBeVisual` runs requestAnimationFrame callbacks off a ~16ms timer, so the
    // grid's post-init work lands after `eval` returns. There is no positive signal to
    // poll for here — the assertion is that nothing blew up — so this window is the
    // observation itself, not a guess at how long the work takes.
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (jsdomErrors.length > 0) {
        throw new Error(
            `jsdom reported ${jsdomErrors.length} error(s): ${jsdomErrors.map((e) => e.message).join('; ')}`
        );
    }

    const api = (dom.window as unknown as { __agScopeHoistingApi?: any }).__agScopeHoistingApi;
    if (!api) {
        throw new Error('the entry did not create a grid — createGrid never returned');
    }
    return {
        rowCount: api.getDisplayedRowCount(),
        columnCount: api.getColumns()?.length ?? 0,
        rendered: dom.window.document.querySelector('.ag-root-wrapper') !== null,
    };
}

async function validateScopeHoisting() {
    const testSuites = new TestSuites('Scope Hoisting Tests');
    const testSuite = new TestSuite('scope hoisting');
    testSuites.addTestSuite(testSuite);

    console.log('Running scope-hoisting size check...');

    for (const testCaseDefinition of CASES) {
        const { name, entry, maxGrowthBytes, rationale } = testCaseDefinition;
        const testCase = new TestCase(name, 'scope hoisting', 0.0);
        testSuite.addTestCase(testCase);

        const concatSize = await buildOnce(entry, true);
        const noConcatSize = await buildOnce(entry, false);
        const growth = noConcatSize - concatSize;

        console.log(`\n  ${name}`);
        console.log(`    concatenateModules: true   ${kb(concatSize)}`);
        console.log(`    concatenateModules: false  ${kb(noConcatSize)}`);
        console.log(`    growth                     ${kb(growth)} (max ${kb(maxGrowthBytes)})`);

        if (growth > maxGrowthBytes) {
            testCase.setFailure(
                [
                    `Bundle grows ${kb(growth)} when scope hoisting is unavailable, over the ${kb(maxGrowthBytes)} limit.`,
                    '',
                    rationale,
                ].join('\n')
            );
            console.error('    FAILED: see above');
        }

        // Both variants are run: they are different builds of the same source, and only
        // the unhoisted one reflects what a consumer using splitChunks actually loads.
        const runCase = new TestCase(`${name} (runs)`, 'scope hoisting', 0.0);
        testSuite.addTestCase(runCase);

        for (const concatenateModules of [true, false]) {
            const variant = concatenateModules ? 'concat' : 'noconcat';
            const bundle = bundlePath(entry, concatenateModules);
            try {
                const { rowCount, columnCount, rendered } = await runBundle(bundle);
                console.log(
                    `    ${variant} runs: ${rowCount} rows, ${columnCount} columns, root ${rendered ? 'ok' : 'MISSING'}`
                );

                if (rowCount !== EXPECTED_ROWS || columnCount === 0 || !rendered) {
                    runCase.setFailure(
                        `Grid built from the ${variant} bundle came up wrong: ${rowCount} rows ` +
                            `(expected ${EXPECTED_ROWS}), ${columnCount} columns, root element ` +
                            `${rendered ? 'present' : 'missing'}.`
                    );
                    console.error('    FAILED: see above');
                }
            } catch (e) {
                runCase.setFailure(
                    [
                        `The ${variant} bundle threw when run: ${e instanceof Error ? e.message : String(e)}`,
                        '',
                        'The published ESM is one file per source module. A module dropped by the build,',
                        'a relative import left without an extension, or a top-level initialiser reading a',
                        'binding from a circular import before it is assigned all produce a bundle of a',
                        'plausible size and only fail when it runs. See esbuild-plugin-multi-file-esm.cjs.',
                    ].join('\n')
                );
                console.error(`    FAILED: ${variant} bundle threw`);
            }
        }
    }

    if (isCI) {
        testSuites.writeJunitReport(path.resolve(__dirname, '../../reports/ag-grid-scope-hoisting.xml'));
    }

    console.log(
        testSuites.hasFailures() ? '\nScope-hoisting size check failed.' : '\nScope-hoisting size check passed.'
    );
    process.exit(testSuites.hasFailures() ? 1 : 0);
}

validateScopeHoisting().catch((e) => {
    console.error(e);
    process.exit(1);
});
