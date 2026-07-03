#!/usr/bin/env node
/**
 * bench-compare.mjs — Compare benchmark performance between two checkouts of the grid.
 *
 * Both sides always run THIS checkout's benchmark files and harness; `base`/`test [dir]` only
 * selects which checkout's grid source (`packages/`) the benches measure (via AG_BENCH_PACKAGES).
 * So the two sides can never drift on differing benchmark definitions — only the grid code differs.
 *
 * Setup:
 *   Clone two sibling checkouts of the monorepo next to each other:
 *     <parent>/ag-grid    — the "test" working copy (your branch with changes)
 *     <parent>/ag-grid2   — the "base" reference copy (typically `latest`)
 *   where <parent> is the folder containing this monorepo root.
 *   Run `yarn install` in the test checkout (the one this script lives in); the base checkout only
 *   needs its `packages/` source present.
 *
 * Usage:
 *   node bench-compare.mjs base [dir] [options]    Measure the base checkout's grid source
 *   node bench-compare.mjs test [dir] [options]    Measure the test checkout's grid source
 *   node bench-compare.mjs compare [options]       Compare saved results and generate report
 *   node bench-compare.mjs all [options]           Run base, then test, then compare
 *
 * Defaults:
 *   base dir: <parent>/ag-grid2
 *   test dir: <parent>/ag-grid
 *   results:  ./tmp/   (relative to this script)
 *
 * Options:
 *   --runs <n>        Re-runs per side (default: 1). Precision comes from each bench's own sampling
 *                     (tinybench rme), not from re-runs; raise this only to guard against a fluky
 *                     process, or lengthen a noisy bench instead. Runs interleave with --runs > 1.
 *   --filter <glob>   Filter benchmark files (forwarded to vitest bench)
 *   --output <path>   Output directory for results (default: ./tmp)
 *   --node            Run benchmarks in node/jsdom instead of the default real Chromium (Playwright).
 *                     Both sides must use the same engine — `compare` refuses a node-vs-browser mix.
 *
 * Files written to the output directory (a `--filter`ed run is incomplete, so its files gain a
 * `-partial` suffix — base-run-1-partial.json, base-meta-partial.json, bench-compare-result-partial.md
 * — to keep them distinct from a full comparison; pass the same `--filter` to `compare`):
 *   base-run-<n>.json         Raw vitest bench output for base run <n> (one file per run).
 *   test-run-<n>.json         Same, for the test side.
 *   base-meta.json            Cohort metadata: engine (node/browser), filter, run files, etc.
 *   bench-compare-result.json Machine-readable comparison: per-benchmark ops/sec, rme, delta
 *                             with confidence interval, and unmatched benchmarks.
 *   bench-compare-result.md   Human-readable report with a Notable Changes table, detailed
 *                             per-group tables, and a list of unmatched benchmarks.
 *
 * Examples:
 *   node bench-compare.mjs all                     # Measure base, then test, then compare
 *   node bench-compare.mjs all --node              # Same, in node/jsdom (faster, no layout)
 *   node bench-compare.mjs base ~/other-grid       # Measure a custom base checkout
 *   node bench-compare.mjs all --runs 5 --filter "getvalue"
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const __dirname = dirname(SELF);

// This script lives at <monorepo>/testing/behavioural/src/benchmarks. The parent of the monorepo
// is four directories up from here, and contains the two sibling checkouts.
const MONOREPO_ROOT = resolve(__dirname, '..', '..', '..', '..');
const SIBLING_PARENT = resolve(MONOREPO_ROOT, '..');

// ── Parse arguments ──

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
    console.log(`Usage:
  node bench-compare.mjs base [dir] [options]   Run base benchmarks
  node bench-compare.mjs test [dir] [options]   Run test benchmarks
  node bench-compare.mjs compare [options]       Compare results
  node bench-compare.mjs all [options]           Run base, then test, then compare
  node bench-compare.mjs backup [options]        Archive the current results into a timestamped subfolder

Both sides always run THIS checkout's benchmark files; base/test [dir] only selects which checkout's
grid source (packages/) they measure. So the comparison can never drift on differing bench definitions.

Options:
  --runs <n>        Re-runs per side (default: 1; precision comes from each bench's sampling, not re-runs)
  --filter <glob>   Filter benchmark files
  --output <path>   Results directory (default: ./tmp)
  --node            Run in node/jsdom instead of the default real Chromium (both sides must match)

Files written to the output directory (a --filter'ed run is incomplete, so its files gain a
"-partial" suffix, e.g. bench-compare-result-partial.md; pass the same --filter to "compare"):
  base-run-<n>.json            Raw vitest output for base run <n> (one per run).
  test-run-<n>.json            Raw vitest output for test run <n> (one per run).
  bench-compare-result.json    Structured comparison (all benchmarks, both sides, deltas).
  bench-compare-result.md      Human-readable report (notable changes + detailed tables).`);
    process.exit(command ? 0 : 1);
}

if (!['base', 'test', 'compare', 'all', 'backup'].includes(command)) {
    console.error(`Unknown command: ${command}. Use 'base', 'test', 'compare', 'all', or 'backup'.`);
    process.exit(1);
}

let runs = 1;
let filter = '';
let outputDir = join(__dirname, 'tmp');
let targetDir = '';
let node = false;

/** Read the value for a `--flag <value>` pair, erroring if the value is missing. */
function takeValue(flag, rawArgs, i) {
    const value = rawArgs[i + 1];
    if (value === undefined || value.startsWith('-')) {
        console.error(`${flag} requires a value`);
        process.exit(1);
    }
    return value;
}

for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
        case '--runs': {
            const raw = takeValue('--runs', args, i++);
            runs = parseInt(raw, 10);
            if (isNaN(runs) || runs < 1) {
                console.error('--runs must be a positive integer');
                process.exit(1);
            }
            break;
        }
        case '--filter':
            filter = takeValue('--filter', args, i++);
            break;
        case '--output':
            outputDir = resolve(takeValue('--output', args, i++));
            break;
        case '--node':
            node = true;
            break;
        default:
            if (args[i].startsWith('-')) {
                console.error(`Unknown option: ${args[i]}`);
                process.exit(1);
            }
            if (!targetDir) {
                targetDir = resolve(args[i]);
            }
            break;
    }
}

// A filtered run only covers some benchmarks, so its outputs are tagged `-partial` to keep them
// distinct from a complete comparison's files (and from each other). Pass the same `--filter` to
// the `compare` command to read the partial cohort back.
const partialSuffix = filter ? '-partial' : '';

// Benchmarks to exclude — these depend on jsdom/DOM rendering and produce
// unreliable results that vary between environments.
const EXCLUDED_BENCH_FILES = ['modules.bench'];

// Resolve target directory defaults: base is the sibling baseline checkout, test is THIS checkout
// (so it works from any folder name / worktree, not just one literally named `ag-grid`).
if (!targetDir && (command === 'base' || command === 'test')) {
    targetDir = command === 'base' ? resolve(SIBLING_PARENT, 'ag-grid2') : MONOREPO_ROOT;
}

mkdirSync(outputDir, { recursive: true });

// ── `backup`: archive the current top-level results into a timestamped subfolder ──

if (command === 'backup') {
    const entries = readdirSync(outputDir);

    // Folder name = the max of the base and test last-run dates (`lastRunAt`) — i.e. the latest actual
    // run across the two sides. `lastRunAt` is set only after a run succeeds, so it ignores an
    // interrupted later run; fall back to the meta write time (`timestamp`) for legacy metas without
    // it. Only the full `base-meta.json` / `test-meta.json` count — partial (`*-meta-partial.json`)
    // runs are excluded from naming (the `-meta.json$` anchor skips them). ISO strings sort
    // chronologically. (All files, partials included, are still copied into the folder below.)
    let maxTimestamp = '';
    for (const name of entries) {
        if (!/-meta\.json$/.test(name)) {
            continue;
        }
        try {
            const meta = JSON.parse(readFileSync(join(outputDir, name), 'utf-8'));
            const ts = meta.lastRunAt || meta.timestamp;
            if (typeof ts === 'string' && ts > maxTimestamp) {
                maxTimestamp = ts;
            }
        } catch {
            // Ignore unparseable / non-meta files.
        }
    }
    if (!maxTimestamp) {
        console.error(`No run metadata with a run date in ${outputDir}. Run "base"/"test"/"all" first.`);
        process.exit(1);
    }

    const folderName = maxTimestamp.slice(0, 19).replace('T', '_').replaceAll(':', '-');
    const dest = join(outputDir, folderName);
    mkdirSync(dest, { recursive: true });

    let copied = 0;
    for (const name of entries) {
        const src = join(outputDir, name);
        if (statSync(src).isFile()) {
            copyFileSync(src, join(dest, name));
            copied++;
        }
    }
    console.log(`Backed up ${copied} file(s) to ${dest}`);
    process.exit(0);
}

// ── Benchmark runner ──

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BEHAVIOURAL_DIR = join(MONOREPO_ROOT, 'testing', 'behavioural');

/** On macOS, wrap a command in `caffeinate -i` so a long run isn't throttled/slept (no-op elsewhere). */
function caffeinated(cmd, cmdArgs) {
    return process.platform === 'darwin'
        ? { cmd: 'caffeinate', args: ['-i', cmd, ...cmdArgs] }
        : { cmd, args: cmdArgs };
}

/** Branch + short commit of a checkout, recorded in the meta so the report says exactly what it compared. */
function gitInfo(dir) {
    const read = (gitArgs) => {
        const r = spawnSync('git', ['-C', dir, ...gitArgs], { encoding: 'utf-8' });
        return r.status === 0 ? r.stdout.trim() : null;
    };
    return { branch: read(['rev-parse', '--abbrev-ref', 'HEAD']), commit: read(['rev-parse', '--short', 'HEAD']) };
}

/** Chromium build version, via the Playwright installed in the behavioural package. Null if unavailable. */
async function chromiumVersion() {
    try {
        const require = createRequire(join(BEHAVIOURAL_DIR, 'package.json'));
        const { chromium } = require('playwright');
        const browser = await chromium.launch();
        const version = browser.version();
        await browser.close();
        return version;
    } catch {
        return null;
    }
}

/** Machine + engine fingerprint shared by both sides — recorded so a report states where it ran. */
async function collectEnv() {
    const cpus = os.cpus();
    return {
        engine: node ? 'node' : 'browser',
        node: process.version,
        chromium: node ? null : await chromiumVersion(),
        cpu: cpus[0]?.model?.trim() ?? 'unknown',
        cpuCount: cpus.length,
        os: `${os.type()} ${os.release()} (${os.arch()})`,
    };
}

/**
 * Ensure the Playwright Chromium build matching the installed `playwright` package is present —
 * browser-mode vitest fails to launch otherwise. `playwright install` is a no-op when up to date.
 */
function ensurePlaywrightBrowsers() {
    // Benches always run from THIS checkout, so install its Playwright browsers.
    spawnSync('npx', ['playwright', 'install', 'chromium', 'chromium-headless-shell'], {
        cwd: BEHAVIOURAL_DIR,
        stdio: 'inherit',
        env: { ...process.env, NX_DAEMON: 'false' },
    });
}

/**
 * Run vitest bench once. Returns the process exit status (0 = clean, non-zero = some benchmark
 * errored — e.g. a feature absent in this checkout — which is NOT necessarily fatal). Returns
 * null only when the benchmark could not be launched at all. The caller decides whether the run
 * is usable by inspecting the output file, not by trusting the exit code alone.
 */
function runBenchmarks(projectDir, outputFile) {
    // Always run THIS checkout's bench code, but alias the grid packages to the checkout being
    // measured (projectDir). Both sides share identical benchmark definitions; only the grid source
    // under test differs.
    if (!existsSync(join(projectDir, 'packages'))) {
        console.error(`Error: ${join(projectDir, 'packages')} does not exist.`);
        return null;
    }

    const benchArgs = ['vitest', 'bench', '--outputJson', outputFile];
    for (const ex of EXCLUDED_BENCH_FILES) {
        benchArgs.push('--exclude', `**/${ex}*`);
    }
    if (filter) {
        benchArgs.push(filter);
    }

    console.log(`  Dir: ${projectDir}`);
    console.log(`  Running: npx ${benchArgs.join(' ')}\n`);

    const { cmd, args: spawnArgs } = caffeinated('npx', benchArgs);
    const result = spawnSync(cmd, spawnArgs, {
        cwd: BEHAVIOURAL_DIR,
        stdio: 'inherit',
        env: {
            ...process.env,
            NX_DAEMON: 'false',
            ...(node ? { BENCH_NODE: '1' } : {}),
            AG_BENCH_PACKAGES: join(projectDir, 'packages'),
        },
    });

    if (result.status !== 0) {
        console.warn(`\n  vitest exited non-zero (${result.status}) — some benchmarks errored; inspecting output.`);
    }
    return result.status;
}

/**
 * Parse a freshly-written run file and classify each benchmark as valid (finite, positive hz) or
 * invalid (errored / not measurable — typically a feature absent in this checkout). Returns null
 * when the file is unusable (missing, unparseable, or zero valid benchmarks) — that's a real
 * failure that must abort the cohort, as opposed to a feature-missing benchmark we can skip.
 */
function inspectRunFile(path) {
    if (!existsSync(path)) {
        return null;
    }
    let parsed;
    try {
        parsed = JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return null;
    }
    if (!Array.isArray(parsed.files)) {
        return null;
    }
    const valid = [];
    const invalid = [];
    for (const file of parsed.files) {
        for (const group of file.groups ?? []) {
            for (const bench of group.benchmarks ?? []) {
                if (Number.isFinite(bench.hz) && bench.hz > 0) {
                    valid.push(bench.name);
                } else {
                    invalid.push(bench.name);
                }
            }
        }
    }
    if (valid.length === 0) {
        return null;
    }
    return { parsed, valid, invalid };
}

/** Stamp a run file with its cohort identity so `compare` can reject stale / cross-cohort files. */
function stampRunFile(path, parsed, stamp) {
    parsed.__benchCompare = stamp;
    writeFileSync(path, JSON.stringify(parsed));
}

// ── Run phase ──

/**
 * Build one side's cohort. Returns `writeMeta(completed)` and `runOne(i)` so callers can drive the
 * runs — sequentially (`base`/`test`) or interleaved across both sides (`all`).
 */
function createSide(label, sideTargetDir, env) {
    // Unique id binding every run file in this cohort to its meta. `compare` refuses to load a run
    // file whose stamp doesn't match — so a stale file left over from an interrupted previous run
    // (different checkout / build) can never be silently averaged in again.
    const cohortId = `${label}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const git = gitInfo(sideTargetDir);
    const metaPath = join(outputDir, `${label}-meta${partialSuffix}.json`);
    const cohortFiles = [];
    for (let i = 1; i <= runs; i++) {
        cohortFiles.push(`${label}-run-${i}${partialSuffix}.json`);
    }
    // Cumulative wall-clock of this side's vitest runs (excludes cooldowns), recorded in the meta.
    let durationMs = 0;
    // ISO time the last run of this side actually finished — the side's own "max run date". Set only
    // after a run succeeds, so an interrupted later run can't poison it (unlike the meta write time).
    let lastRunAt = '';
    // Per-benchmark rme samples across runs, used to suggest the noiseFactor each bench should set.
    const rmeByName = new Map();

    // The `compare` phase reads both sides' metadata to (a) refuse incompatible settings (filter,
    // engine, exclude list), (b) load only the declared run files, and (c) reject incomplete or
    // mismatched-cohort files. We write meta up-front with completed:false so an interrupted run
    // is detectable, then rewrite completed:true only once every run has produced usable output.
    function writeMeta(completed) {
        writeFileSync(
            metaPath,
            JSON.stringify(
                {
                    label,
                    cohortId,
                    completed,
                    engine: node ? 'node' : 'browser',
                    partial: !!filter,
                    filter,
                    excludedFiles: EXCLUDED_BENCH_FILES,
                    runsRequested: runs,
                    runFiles: cohortFiles,
                    targetDir: sideTargetDir,
                    git,
                    env,
                    durationMs,
                    lastRunAt,
                    // Per-bench noiseFactor to set, from this side's measured rme:
                    // - band: lands rme in [0.5%, 1.5%] (can be 8–16×, slow — the "ideal").
                    // - pragmatic: capped ≤4×, accepts ~2.5% rme — a sane default to actually set.
                    suggestedNoiseFactors: {
                        band: buildFactors(suggestNoiseFactor),
                        pragmatic: buildFactors(pragmaticNoiseFactor),
                    },
                    timestamp: new Date().toISOString(),
                },
                null,
                2
            )
        );
    }

    /**
     * Worst (max) rme per bench across runs → factor via `fn`; only entries that differ from 1.
     * Max, not mean: a factor must cover the noisiest run, else a bench that was tight once and
     * loose twice would be under-provisioned.
     */
    function buildFactors(fn) {
        const out = {};
        for (const [name, samples] of rmeByName) {
            const factor = fn(Math.max(...samples));
            if (factor !== 1) {
                out[name] = factor;
            }
        }
        return out;
    }

    function runOne(i) {
        const outFile = join(outputDir, `${label}-run-${i}${partialSuffix}.json`);
        console.log(`--- ${label} run ${i}/${runs} (${sideTargetDir}) ---`);
        const start = Date.now();
        const status = runBenchmarks(sideTargetDir, outFile);
        durationMs += Date.now() - start;
        if (status === null) {
            console.error(`${label} benchmark could not be launched at run ${i}, aborting.`);
            process.exit(1);
        }

        // Decide usability from the output, not the exit code: a non-zero exit caused only by a
        // feature-missing benchmark still leaves a fully usable file for everything else.
        const inspected = inspectRunFile(outFile);
        if (!inspected) {
            console.error(
                `${label} run ${i} produced no usable benchmark results (vitest exit ${status}). ` +
                    `This is a real failure (build/import error), not a missing feature. Aborting.`
            );
            process.exit(1);
        }
        if (inspected.invalid.length > 0) {
            console.warn(
                `  Note: ${inspected.invalid.length} benchmark(s) not measurable on the ${label} side ` +
                    `(feature likely absent in this checkout) — they will be skipped, not compared:`
            );
            for (const name of inspected.invalid) {
                console.warn(`    - ${name}`);
            }
        }
        stampRunFile(outFile, inspected.parsed, { cohortId, label, runIndex: i });
        lastRunAt = new Date().toISOString();

        // Collect each bench's rme so the meta can suggest per-bench noiseFactors.
        for (const file of inspected.parsed.files ?? []) {
            for (const group of file.groups ?? []) {
                for (const bench of group.benchmarks ?? []) {
                    let samples = rmeByName.get(bench.name);
                    if (!samples) {
                        samples = [];
                        rmeByName.set(bench.name, samples);
                    }
                    samples.push(bench.rme);
                }
            }
        }
    }

    return { writeMeta, runOne, getDurationMs: () => durationMs };
}

/** Format a millisecond duration as a short human string (e.g. "4.1s", "1m 12s"). */
function fmtDuration(ms) {
    const s = ms / 1000;
    if (s < 60) {
        return `${s.toFixed(1)}s`;
    }
    return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

// The noiseFactor (relative to the bench's current sampling) that would land its rme in [0.5%, 1.7%].
// rme ∝ 1/√time, so reaching the band costs (rme/target)² more time; < 0.5% means over-sampled, so a
// factor below 1 runs it faster (floored at 0.5 — 0.25 risks under-sampling). Returns 1 when in band.
// Capped — benches needing more are inherently noisy (high per-iteration cost → few samples).
const NOISE_BAND_LOW = 0.5;
const NOISE_BAND_HIGH = 1.7;
const OVER_SAMPLED_FLOOR = 0.5;
function suggestNoiseFactor(rme) {
    if (rme >= NOISE_BAND_LOW && rme <= NOISE_BAND_HIGH) {
        return 1;
    }
    const factor = rme * rme; // (rme / 1.0%)²
    if (factor >= 1) {
        return Math.min(16, Math.ceil(factor));
    }
    return Math.max(OVER_SAMPLED_FLOOR, Math.round(factor * 4) / 4);
}

// Pragmatic factor: accept up to ~2.5% rme as-is, cap the bump at 4× (so precision improves without
// the band's 8–16× blow-up), but still drop below 1 for over-sampled benches so they run faster.
function pragmaticNoiseFactor(rme) {
    if (rme < NOISE_BAND_LOW) {
        return Math.max(OVER_SAMPLED_FLOOR, Math.round(rme * rme * 4) / 4);
    }
    if (rme <= 2.5) {
        return 1;
    }
    return Math.min(4, Math.ceil((rme / 2) ** 2)); // target ~2%
}

async function cooldown(i) {
    if (i > 1) {
        console.log('--- Cooldown (4s) ---');
        await sleep(4000);
    }
}

if (command === 'base' || command === 'test') {
    console.log(`=== Running ${command} benchmarks ===`);
    console.log(`Directory:  ${targetDir}`);
    console.log(`Runs:       ${runs}`);
    console.log(`Output:     ${outputDir}`);
    if (filter) {
        console.log(`Filter:     ${filter}`);
    }
    console.log(`Env:        ${node ? 'node/jsdom' : 'real Chromium (Playwright)'}`);
    console.log('');

    if (!node) {
        ensurePlaywrightBrowsers();
    }

    const env = await collectEnv();
    const side = createSide(command, targetDir, env);
    side.writeMeta(false);
    for (let i = 1; i <= runs; i++) {
        await cooldown(i);
        side.runOne(i);
        console.log('');
    }
    side.writeMeta(true);

    console.log(
        `\n=== ${command} benchmarks complete in ${fmtDuration(side.getDurationMs())} ` +
            `(${runs} runs saved to ${outputDir}) ===`
    );
    process.exit(0);
}

if (command === 'all') {
    const baseDir = targetDir || resolve(SIBLING_PARENT, 'ag-grid2');
    const testDir = MONOREPO_ROOT;
    console.log(`=== Running all — interleaved test/base ===`);
    console.log(`Base:       ${baseDir}`);
    console.log(`Test:       ${testDir}`);
    console.log(`Runs:       ${runs} per side`);
    console.log(`Env:        ${node ? 'node/jsdom' : 'real Chromium (Playwright)'}`);
    console.log('');

    if (!node) {
        ensurePlaywrightBrowsers();
    }

    const env = await collectEnv();
    const test = createSide('test', testDir, env);
    const base = createSide('base', baseDir, env);
    test.writeMeta(false);
    base.writeMeta(false);

    // Interleave test then base every run, so slow machine drift (thermal throttling, background
    // load) biases both sides equally instead of penalising whichever ran last.
    let coolIndex = 1;
    for (let i = 1; i <= runs; i++) {
        await cooldown(coolIndex++);
        test.runOne(i);
        await cooldown(coolIndex++);
        base.runOne(i);
        console.log('');
    }

    test.writeMeta(true);
    base.writeMeta(true);

    console.log(
        `\n=== runs complete — test ${fmtDuration(test.getDurationMs())}, ` +
            `base ${fmtDuration(base.getDurationMs())}, ` +
            `total ${fmtDuration(test.getDurationMs() + base.getDurationMs())} ===`
    );

    console.log(`\n========== bench-compare compare ==========`);
    const compareArgs = ['--output', outputDir];
    if (filter) {
        compareArgs.push('--filter', filter);
    }
    const result = spawnSync('node', [SELF, 'compare', ...compareArgs], { stdio: 'inherit' });
    process.exit(result.status ?? 1);
}

// ── Compare phase ──

console.log('=== Comparing results... ===\n');

/**
 * Load exactly the run files declared in the side's metadata (`runFiles`). Files outside this
 * list — e.g. stale higher-index files from a previous invocation with a larger --runs value —
 * are ignored so stale data cannot silently contaminate the aggregation.
 * Aborts if any declared file is missing or fails to parse.
 */
function loadRuns(label, meta) {
    const fileNames = meta.runFiles;
    if (!Array.isArray(fileNames) || fileNames.length === 0) {
        console.error(
            `Error: ${label}-meta.json is missing runFiles. Re-run "node bench-compare.mjs ${label}" to regenerate.`
        );
        process.exit(1);
    }

    const results = [];
    for (const name of fileNames) {
        const path = join(outputDir, name);
        if (!existsSync(path)) {
            console.error(
                `Error: declared run file ${path} is missing. Re-run "node bench-compare.mjs ${label}" to regenerate.`
            );
            process.exit(1);
        }
        let parsed;
        try {
            parsed = JSON.parse(readFileSync(path, 'utf-8'));
        } catch (err) {
            console.error(`Error: failed to parse ${path}: ${err.message}`);
            process.exit(1);
        }
        // Cohort integrity: a run file must carry the same cohortId as its meta. A mismatch means
        // the file is stale — left over from an earlier, interrupted run against a different build
        // — which is exactly what produces nonsensical averaged baselines. Refuse it.
        if (meta.cohortId) {
            const stampId = parsed.__benchCompare?.cohortId;
            if (stampId !== meta.cohortId) {
                console.error(
                    `Error: ${name} is not part of the current ${label} cohort ` +
                        `(file cohortId=${stampId ?? 'none'}, expected ${meta.cohortId}). ` +
                        `A previous "${label}" run was likely interrupted, leaving a stale file behind. ` +
                        `Re-run "node bench-compare.mjs ${label}" to regenerate a clean cohort.`
                );
                process.exit(1);
            }
        }
        results.push(parsed);
    }
    return results;
}

function isExcluded(filepath) {
    return EXCLUDED_BENCH_FILES.some((ex) => filepath.includes(ex));
}

/**
 * Extract a file-unique identifier from a filepath. Returns a path relative to the monorepo
 * root (stable across base/test checkouts that live in different absolute directories) by
 * anchoring on the first known top-level segment. Falls back to the basename if nothing
 * recognisable is found.
 */
const RELATIVE_ANCHORS = ['/testing/', '/packages/', '/community-modules/', '/external/'];
function fileIdentity(filepath) {
    for (const anchor of RELATIVE_ANCHORS) {
        const idx = filepath.lastIndexOf(anchor);
        if (idx !== -1) {
            return filepath.slice(idx + 1); // strip the leading '/'
        }
    }
    const slash = filepath.lastIndexOf('/');
    return slash === -1 ? filepath : filepath.slice(slash + 1);
}

function extractBenchmarks(runData) {
    const map = new Map();
    for (const file of runData.files) {
        if (isExcluded(file.filepath)) {
            continue;
        }
        const fileId = fileIdentity(file.filepath);
        for (const group of file.groups) {
            for (const bench of group.benchmarks) {
                // Include fileId in the key — two files can legitimately share
                // suite/bench names, and without it one would silently overwrite the other.
                const key = `${fileId} :: ${group.fullName} > ${bench.name}`;
                map.set(key, {
                    name: bench.name,
                    group: group.fullName,
                    file: fileId,
                    hz: bench.hz,
                    mean: bench.mean,
                    min: bench.min,
                    rme: bench.rme,
                    sd: bench.sd,
                    sampleCount: bench.sampleCount,
                    // p99/median: a high ratio means rare large spikes (GC/thermal pauses) rather than
                    // broadband variance — those benches don't tighten with more samples, only less data.
                    spike: bench.median > 0 ? bench.p99 / bench.median : 1,
                    totalTime: bench.totalTime ?? 0,
                });
            }
        }
    }
    return map;
}

/** Sample standard deviation (Bessel-corrected). Returns 0 if n < 2. */
function sampleStdDev(values, mean) {
    if (values.length < 2) {
        return 0;
    }
    let sumSq = 0;
    for (const v of values) {
        const d = v - mean;
        sumSq += d * d;
    }
    return Math.sqrt(sumSq / (values.length - 1));
}

/**
 * Aggregate benchmark results across all runs.
 * - Point estimate: inverse-variance weighted mean hz — each run weighted by 1/MoE², so a run with
 *   a tighter confidence interval counts for more (better than a plain mean/median of medians).
 * - Uncertainty: max of (a) the combined within-run CI from that weighting, and (b) the run-to-run
 *   relative std dev. The max keeps a tight within-run CI from hiding real run-to-run variance.
 * With a single run this reduces to that run's own hz and rme.
 */
function aggregateRuns(allRuns) {
    // Collect per-benchmark samples across runs
    const samplesByKey = new Map();

    for (const runData of allRuns) {
        const benchmarks = extractBenchmarks(runData);
        for (const [key, data] of benchmarks) {
            let bucket = samplesByKey.get(key);
            if (!bucket) {
                bucket = {
                    name: data.name,
                    group: data.group,
                    file: data.file,
                    hz: [],
                    rme: [],
                    spike: [],
                    totalTime: [],
                    sampleCount: 0,
                };
                samplesByKey.set(key, bucket);
            }
            bucket.hz.push(data.hz);
            bucket.rme.push(data.rme);
            bucket.spike.push(data.spike);
            bucket.totalTime.push(data.totalTime);
            bucket.sampleCount += data.sampleCount;
        }
    }

    const result = new Map();
    for (const [key, bucket] of samplesByKey) {
        const hzs = bucket.hz;
        const rmes = bucket.rme;
        const n = hzs.length;
        const meanHz = hzs.reduce((a, b) => a + b, 0) / n;

        // Inverse-variance weighting in absolute margin-of-error units. The 95% z-factor cancels
        // between each weight and the combined MoE, so working in MoE directly is exact.
        let weightSum = 0;
        let weightedHzSum = 0;
        let allMoEUsable = true;
        for (let i = 0; i < n; i++) {
            const moe = (hzs[i] * rmes[i]) / 100;
            if (!(moe > 0)) {
                allMoEUsable = false;
                break;
            }
            const weight = 1 / (moe * moe);
            weightSum += weight;
            weightedHzSum += weight * hzs[i];
        }

        let hz;
        let withinRme;
        if (allMoEUsable && weightSum > 0) {
            hz = weightedHzSum / weightSum;
            const combinedMoE = Math.sqrt(1 / weightSum);
            withinRme = hz > 0 ? (combinedMoE / hz) * 100 : 0;
        } else {
            // A run reported rme 0 / non-finite — fall back to a plain mean and the mean rme.
            hz = meanHz;
            withinRme = rmes.reduce((a, b) => a + b, 0) / n;
        }

        // Run-to-run scatter — don't let a tight within-run CI hide real between-run variance.
        const betweenRme = meanHz > 0 ? (sampleStdDev(hzs, meanHz) / meanHz) * 100 : 0;

        result.set(key, {
            name: bucket.name,
            group: bucket.group,
            file: bucket.file,
            hz,
            rme: Math.max(withinRme, betweenRme),
            spike: Math.max(...bucket.spike),
            totalTime: bucket.totalTime.reduce((a, b) => a + b, 0) / bucket.totalTime.length,
            sampleCount: bucket.sampleCount,
            runCount: n,
        });
    }
    return result;
}

/** Read the sidecar metadata file for a side. Returns null if missing (e.g. legacy runs). */
function loadMeta(label) {
    const path = join(outputDir, `${label}-meta${partialSuffix}.json`);
    if (!existsSync(path)) {
        return null;
    }
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch (err) {
        console.error(`Error: failed to parse ${path}: ${err.message}`);
        process.exit(1);
    }
}

const baseMeta = loadMeta('base');
const testMeta = loadMeta('test');

if (!baseMeta || !testMeta) {
    const missing = !baseMeta ? 'base' : 'test';
    console.error(
        `Error: ${missing}-meta.json not found in ${outputDir}. Re-run "node bench-compare.mjs ${missing}" to regenerate.`
    );
    process.exit(1);
}

// Refuse a side whose run loop never finished: its run files are a half-recorded cohort (the exact
// state that mixes a fresh run with a stale one). `completed` is absent on legacy meta files, which
// we tolerate — but the cohortId stamp check in loadRuns still guards those.
for (const [label, meta] of [
    ['base', baseMeta],
    ['test', testMeta],
]) {
    if (meta.completed === false) {
        console.error(
            `Error: the ${label} cohort is incomplete — a previous "${label}" run did not finish ` +
                `(likely interrupted by an errored benchmark). Re-run "node bench-compare.mjs ${label}" before comparing.`
        );
        process.exit(1);
    }
}

// Different filter values still compare — we only report on the intersection of benchmark keys
// (unmatched ones land in the unmatched-benchmarks section). Warn so the user notices.
if (baseMeta.filter !== testMeta.filter) {
    console.warn(
        `Warning: base and test were produced with different --filter values ` +
            `(base: ${JSON.stringify(baseMeta.filter)}, test: ${JSON.stringify(testMeta.filter)}). ` +
            `Comparison restricted to the intersection of benchmarks.\n`
    );
}
// Different runs counts are tolerated. Each side's rme already mixes run-to-run std with the
// within-run rme (`Math.max` floor), so a side with fewer runs reports the larger of the two
// uncertainties — its noise band widens naturally. Warn loudly when the gap is big enough that
// the user should consider re-running.
const baseRunsCount = baseMeta.runFiles?.length ?? 0;
const testRunsCount = testMeta.runFiles?.length ?? 0;
if (baseRunsCount !== testRunsCount) {
    console.warn(
        `Warning: unequal run counts (base: ${baseRunsCount}, test: ${testRunsCount}). ` +
            `The side with fewer runs has a wider noise band; deltas near the margin may flip ` +
            `after re-running with matched counts.\n`
    );
}
const baseExcl = (baseMeta.excludedFiles ?? []).join(',');
const testExcl = (testMeta.excludedFiles ?? []).join(',');
if (baseExcl !== testExcl) {
    console.error(
        `Error: base and test were produced with different excluded-file lists ` +
            `(base: [${baseExcl}], test: [${testExcl}]). Re-run both sides with the same exclude configuration.`
    );
    process.exit(1);
}
// Node and browser timings are not comparable (different engine, layout, GC). Refuse a cross-engine
// comparison rather than report a meaningless delta. `engine` is absent on legacy meta — tolerate that.
const baseEngine = baseMeta.engine;
const testEngine = testMeta.engine;
if (baseEngine && testEngine && baseEngine !== testEngine) {
    console.error(
        `Error: base and test were run with different engines (base: ${baseEngine}, test: ${testEngine}). ` +
            `Re-run both sides with the same engine — either both default (browser) or both with --node.`
    );
    process.exit(1);
}

const baseRuns = loadRuns('base', baseMeta);
const testRuns = loadRuns('test', testMeta);

const baseAgg = aggregateRuns(baseRuns);
const testAgg = aggregateRuns(testRuns);

// Report unmatched benchmarks
const baseOnly = [...baseAgg.keys()].filter((k) => !testAgg.has(k));
const testOnly = [...testAgg.keys()].filter((k) => !baseAgg.has(k));
if (baseOnly.length > 0) {
    console.log(`Note: ${baseOnly.length} benchmark(s) only in base (removed or renamed?):`);
    for (const k of baseOnly) {
        console.log(`  - ${baseAgg.get(k).name}`);
    }
}
if (testOnly.length > 0) {
    console.log(`Note: ${testOnly.length} benchmark(s) only in test (added or renamed?):`);
    for (const k of testOnly) {
        console.log(`  - ${testAgg.get(k).name}`);
    }
}

// Build comparison using within-run rme for confidence intervals
const comparisons = [];
const invalidComparisons = [];
for (const [key, base] of baseAgg) {
    const test = testAgg.get(key);
    if (!test) {
        continue;
    }

    // Guard against zero / non-finite baseline (or test) hz — would yield Infinity/NaN in the
    // delta and contaminate the report. We surface these as a separate "invalid" list instead.
    const baseHzValid = Number.isFinite(base.hz) && base.hz > 0;
    const testHzValid = Number.isFinite(test.hz) && test.hz >= 0;
    if (!baseHzValid || !testHzValid) {
        invalidComparisons.push({
            key,
            name: base.name,
            group: base.group,
            file: base.file,
            baseHz: base.hz,
            testHz: test.hz,
            reason: !baseHzValid ? 'invalid base hz' : 'invalid test hz',
        });
        continue;
    }

    const delta = ((test.hz - base.hz) / base.hz) * 100;

    // Combined margin of error from both sides' rme (propagated in quadrature)
    const combinedRme = Math.sqrt(base.rme ** 2 + test.rme ** 2);
    const deltaLo = round(delta - combinedRme, 1);
    const deltaHi = round(delta + combinedRme, 1);

    comparisons.push({
        key,
        name: base.name,
        group: base.group,
        file: base.file,
        baseHz: round(base.hz, 4),
        baseRme: round(base.rme, 2),
        baseSamples: base.sampleCount,
        testHz: round(test.hz, 4),
        testRme: round(test.rme, 2),
        testSamples: test.sampleCount,
        testSpike: round(test.spike, 2),
        testTime: round(test.totalTime, 0),
        delta: round(delta, 2),
        deltaLo,
        deltaHi,
        deltaConservative: deltaLo > 0 ? deltaLo : deltaHi < 0 ? deltaHi : 0,
        combinedRme: round(combinedRme, 2),
    });
}

if (invalidComparisons.length > 0) {
    console.log(
        `Note: ${invalidComparisons.length} benchmark(s) skipped due to invalid hz (non-finite or non-positive base):`
    );
    for (const c of invalidComparisons) {
        console.log(`  - ${c.name}: ${c.reason} (base=${c.baseHz}, test=${c.testHz})`);
    }
}

function round(v, decimals) {
    const f = 10 ** decimals;
    return Math.round(v * f) / f;
}

/**
 * Sort biggest-change-first. Primary key is the signed raw delta — the same metric the
 * "Result" column shows ("1.20x faster" etc.) — so the visible ordering matches the displayed
 * numbers. Conservative delta is used elsewhere (to classify rows as certain vs noisy) but
 * disagreed with what readers see in the Result column when used as the sort key.
 *
 * Within each direction (improvements / regressions), descending by magnitude — so the
 * biggest improvement is at the top, then smaller improvements, then unchanged, then small
 * regressions, then the worst regression at the bottom. This is sign-aware: regressions stay
 * grouped at the bottom rather than sorting purely by absolute magnitude.
 *
 * Tie-break on conservative delta (so equally-fast benchmarks with tighter CIs rank higher)
 * then on name for determinism.
 */
function bySignedDeltaDesc(a, b) {
    const rawDiff = b.delta - a.delta;
    if (rawDiff !== 0) {
        return rawDiff;
    }
    const ciDiff = b.deltaConservative - a.deltaConservative;
    if (ciDiff !== 0) {
        return ciDiff;
    }
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

comparisons.sort(bySignedDeltaDesc);

// ── Output ──

const jsonPath = join(outputDir, `bench-compare-result${partialSuffix}.json`);
const mdPath = join(outputDir, `bench-compare-result${partialSuffix}.md`);

writeFileSync(
    jsonPath,
    JSON.stringify(
        {
            baseRuns: baseRuns.length,
            testRuns: testRuns.length,
            benchmarks: comparisons,
            baseOnly: baseOnly.map((k) => baseAgg.get(k).name),
            testOnly: testOnly.map((k) => testAgg.get(k).name),
            invalid: invalidComparisons,
        },
        null,
        2
    )
);

// ── Markdown ──

function fmtHz(hz) {
    if (hz >= 10000) {
        return hz.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    if (hz >= 100) {
        return hz.toFixed(1);
    }
    if (hz >= 10) {
        return hz.toFixed(2);
    }
    return hz.toFixed(3);
}

/**
 * Report-friendly file label. Drops the default benchmark-folder prefix for files that live
 * there (so `foo.bench.ts` / `tree-data/flatten.bench.ts` show without the long `testing/...`
 * path) and strips the `.bench.ts` suffix everywhere for brevity.
 */
const BENCH_DIR_PREFIX = 'testing/behavioural/src/benchmarks/';
// Keep the `.bench.ts` extension so the column names the file to edit when adjusting a noiseFactor.
function shortFile(file) {
    return file.startsWith(BENCH_DIR_PREFIX) ? file.slice(BENCH_DIR_PREFIX.length) : file;
}

/** Format speedup as "1.23x faster" / "1.10x slower" / "unchanged". */
function fmtSpeedup(c) {
    if (!(c.baseHz > 0) || !(c.testHz > 0)) {
        return 'n/a';
    }
    const ratio = c.testHz / c.baseHz;
    if (ratio >= 1.005) {
        return `${ratio.toFixed(2)}x faster`;
    }
    if (ratio <= 0.995) {
        return `${(1 / ratio).toFixed(2)}x slower`;
    }
    return 'unchanged';
}

/** A result is "noisy" when the delta is within the combined margin of error. */
function isNoisy(c) {
    return c.deltaConservative === 0;
}

// Reporting thresholds. Small raw deltas inside the confidence interval are just benchmark
// jitter and add noise to the report - filter them out.
//
// - CERTAIN_MIN_PCT: the *conservative* delta (CI endpoint nearest zero) must exceed this. 2% — the
//   timer + GC-stability fixes tightened most benches to ~1–2% rme, so a real ~2% move clears its CI
//   and is worth surfacing, without flagging sub-2% wobble. (Was 3; 1.6 proved too aggressive.)
// - NOISY_MIN_PCT: only surface within-CI items when the raw delta is large enough to suggest
//   the benchmark is flaky or needs more runs - not every 3% wobble.
const CERTAIN_MIN_PCT = 2;
const NOISY_MIN_PCT = 10;

// Precision bands for the console summary: ≥ HIGH = imprecise (raise noiseFactor), ≤ LOW =
// over-sampled (lower it to run faster). The per-bench factors come from suggestNoiseFactor /
// pragmaticNoiseFactor, surfaced in the report's "Suggested noiseFactors" table.
const RME_HIGH_PCT = 3;
const RME_LOW_PCT = 0.5;

const partialFilter = baseMeta.partial || testMeta.partial ? baseMeta.filter || testMeta.filter : '';
let md = partialFilter ? `# Benchmark Comparison (partial)\n\n` : `# Benchmark Comparison\n\n`;
if (partialFilter) {
    md += `> ⚠️ **Partial run** — filtered to \`${partialFilter}\`. This is not a complete comparison.\n\n`;
}
const baseRunCount = baseRuns.length;
const testRunCount = testRuns.length;
const runCountLabel =
    baseRunCount === testRunCount
        ? `${baseRunCount} run(s) per side`
        : `${baseRunCount} base run(s), ${testRunCount} test run(s)`;
const totalDurationMs = (baseMeta.durationMs ?? 0) + (testMeta.durationMs ?? 0);

// First chapter: exactly what was compared, and where it ran. (rme / aggregation method belong with
// the detailed tables — they say nothing useful for a single run.)
const reportEnv = baseMeta.env ?? testMeta.env ?? {};
const sideLine = (label, meta) => {
    const g = meta.git;
    const where = g?.branch ? `\`${g.branch}\`${g.commit ? ` @ ${g.commit}` : ''}` : '(unknown branch)';
    const dir = meta.targetDir ? ` · \`${basename(meta.targetDir)}\`` : '';
    return `- **${label}** — ${where}${dir}`;
};
const engineLine =
    reportEnv.engine === 'node'
        ? `node ${reportEnv.node ?? '?'} + jsdom (no layout engine)`
        : `real browser — Chromium ${reportEnv.chromium ?? '?'} (node ${reportEnv.node ?? '?'})`;
md += `## Comparison\n\n`;
md += `${sideLine('base', baseMeta)}\n`;
md += `${sideLine('test', testMeta)}\n`;
md += `- **Engine** — ${engineLine}\n`;
if (reportEnv.cpu) {
    md += `- **CPU** — ${reportEnv.cpu}${reportEnv.cpuCount ? ` × ${reportEnv.cpuCount}` : ''}\n`;
}
md += `- **Runs** — ${runCountLabel} · ${fmtDuration(totalDurationMs)} `;
md += `(base ${fmtDuration(baseMeta.durationMs ?? 0)}, test ${fmtDuration(testMeta.durationMs ?? 0)})\n`;
// Later of the two sides — the run as a whole finished when the slower side did. ISO strings sort lexically.
const runTimes = [testMeta.lastRunAt ?? testMeta.timestamp, baseMeta.lastRunAt ?? baseMeta.timestamp].filter(Boolean);
const ranAtIso = runTimes.length ? runTimes.reduce((a, b) => (a > b ? a : b)) : '';
const ranAt = ranAtIso
    ? new Date(ranAtIso).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }).replace(',', '')
    : '';
md += ranAt ? `- **When** — ${ranAt} (UK)\n\n` : `\n`;
// Aggregation method only matters across multiple runs; for a single run hz/rme are the run's own.
if (baseRunCount > 1 || testRunCount > 1) {
    md += `> Aggregation: inverse-variance weighted hz; rme = max(run-to-run std, within-run rme).\n\n`;
}

// "Certain" = confidence interval excludes zero AND its nearest endpoint exceeds the threshold.
// "Noisy"   = delta is within the CI (flaky or needs more runs), only surfaced when the raw
//             delta is large enough to warrant investigation.
const notableCertain = comparisons
    .filter((c) => !isNoisy(c) && Math.abs(c.deltaConservative) >= CERTAIN_MIN_PCT)
    .sort(bySignedDeltaDesc);
const notableNoisy = comparisons
    .filter((c) => isNoisy(c) && Math.abs(c.delta) >= NOISY_MIN_PCT)
    .sort(bySignedDeltaDesc);
const notable = [...notableCertain, ...notableNoisy];

function writeNotableTable(header, rows) {
    if (rows.length === 0) {
        return;
    }
    md += `${header}\n\n`;
    md += `| File | Benchmark | base (ops/s) | test (ops/s) | Result |\n`;
    md += `|------|-----------|-------------|-------------|--------|\n`;
    for (const c of rows) {
        md += `| ${shortFile(c.file)} | ${c.name} | ${fmtHz(c.baseHz)} | ${fmtHz(c.testHz)} | **${fmtSpeedup(c)}** |\n`;
    }
    md += `\n`;
}

if (notable.length > 0) {
    writeNotableTable('## Notable Changes (outside margin of error)', notableCertain);
    writeNotableTable('## Notable Changes — Noisy (delta within margin of error)', notableNoisy);
} else {
    md += `## No notable changes detected.\n\n`;
}

// The benches that ran but moved within noise — so the report says how many were checked, not just
// the few that changed.
const unchangedCount = comparisons.length - notable.length;
if (unchangedCount > 0) {
    md += `_${unchangedCount} other benchmark(s) ran with no notable change._\n\n`;
}

// Suggested noiseFactor changes are tuned to the TEST side (the branch being adjusted). Base runs the
// SAME bench code, so it's a thermal cross-check: if base is also noisy the variance is real/inherent
// and worth a factor; if base is calm but test is noisy it's likely a thermal fluke on the test run —
// re-run before chasing it. The "band" factor targets rme [0.5%, 1.5%]; "pragmatic" caps the bump at 4×.
const CORROBORATION_RATIO = 0.6; // base rme ≥ 60% of test's ⇒ the noise shows on both sides ⇒ real.
const SPIKE_THRESHOLD = 2.5; // p99/median above this ⇒ rare large pauses dominate; more samples barely help.
// Noise floor = this run's median rme. On a thermally-hot run most benches sit near it (base is hot too,
// so they all "corroborate"), so only flag a bench well ABOVE the floor — a true outlier worth acting
// on, not the whole thermal baseline. OVER_FACTORED_MS: an over-precise bench is only worth lowering if
// it actually spends time (high factor); a cheap bench is precise because it's fast, not over-sampled.
const NOISE_FLOOR_RATIO = 2.5;
const OVER_FACTORED_MS = 3000;
const rmeSorted = comparisons.map((c) => c.testRme).sort((a, b) => a - b);
const noiseFloor = rmeSorted.length ? rmeSorted[Math.floor(rmeSorted.length / 2)] : 0;
const aboveFloor = (t) => t.rme > noiseFloor * NOISE_FLOOR_RATIO;
const tuning = comparisons
    .map((c) => ({
        c,
        rme: c.testRme,
        baseRme: c.baseRme,
        spike: c.testSpike,
        time: c.testTime,
        band: suggestNoiseFactor(c.testRme),
        prag: pragmaticNoiseFactor(c.testRme),
        corroborated: c.baseRme >= c.testRme * CORROBORATION_RATIO,
        spikeBound: c.testSpike >= SPIKE_THRESHOLD,
    }))
    .filter((t) => t.band !== 1 || t.prag !== 1)
    .sort((a, b) => b.rme - a.rme);

// Buckets. Noisy buckets require the bench to be a real outlier (aboveFloor) AND corroborated by base —
// otherwise it's just this run's thermal baseline, with no action to take. Over-sampled benches are only
// worth listing when they actually spend time (over-factored), else lowering saves nothing meaningful.
const overSampled = tuning.filter((t) => t.prag < 1 && t.time > OVER_FACTORED_MS);
const thermalSuspect = tuning.filter((t) => t.prag > 1 && !t.corroborated && aboveFloor(t));
const raise = tuning.filter((t) => t.prag > 1 && t.corroborated && !t.spikeBound && aboveFloor(t));
const reduceData = tuning.filter((t) => t.prag > 1 && t.corroborated && t.spikeBound && aboveFloor(t));
const review = tuning.filter((t) => t.prag === 1 && t.band > 1 && t.corroborated && aboveFloor(t));

function writeFactorTable(header, note, rows) {
    if (rows.length === 0) {
        return;
    }
    md += `### ${header}\n\n${note}\n\n`;
    md += `| File | Benchmark | test rme | base rme | spike | band | pragmatic |\n|------|-----------|---------|---------|-------|------|-----------|\n`;
    for (const t of rows) {
        md += `| ${shortFile(t.c.file)} | ${t.c.name} | ±${t.rme.toFixed(2)}% | ±${t.baseRme.toFixed(2)}% | ${t.spike.toFixed(1)}× | ×${t.band} | ×${t.prag} |\n`;
    }
    md += `\n`;
}

// Suggested noiseFactors table is rendered at the very end of the report (after Detailed Results).

// Key by file + group so two bench files with identically-named suites don't get merged into
// one section (and so each section's header can show its file of origin).
const byFileGroup = new Map();
for (const c of comparisons) {
    const key = `${c.file} :: ${c.group}`;
    if (!byFileGroup.has(key)) {
        byFileGroup.set(key, { file: c.file, group: c.group, items: [] });
    }
    byFileGroup.get(key).items.push(c);
}

if (byFileGroup.size > 0) {
    md += `## Detailed Results\n\n`;
    md += `rme = relative margin of error (lower = more precise).\n\n`;

    for (const { file, group, items } of byFileGroup.values()) {
        const shortGroup = group.includes(' > ') ? group.split(' > ').pop() : group;
        md += `### ${shortFile(file)} › ${shortGroup}\n\n`;
        md += `| Benchmark | base ops/s (rme) | test ops/s (rme) | Result |\n`;
        md += `|-----------|-----------------|-----------------|--------|\n`;
        for (const c of items) {
            const result = fmtSpeedup(c);
            const cell = isNoisy(c) ? `${result} <sub>noisy</sub>` : `**${result}**`;
            md += `| ${c.name} | ${fmtHz(c.baseHz)} (±${c.baseRme.toFixed(1)}%) | ${fmtHz(c.testHz)} (±${c.testRme.toFixed(1)}%) | ${cell} |\n`;
        }
        md += `\n`;
    }
}

if (baseOnly.length > 0 || testOnly.length > 0) {
    md += `## Unmatched Benchmarks\n\n`;
    if (baseOnly.length > 0) {
        md += `**Only in base** (removed or renamed?):\n`;
        for (const k of baseOnly) {
            const b = baseAgg.get(k);
            md += `- [${shortFile(b.file)}] ${b.name}\n`;
        }
        md += `\n`;
    }
    if (testOnly.length > 0) {
        md += `**Only in test** (added or renamed?):\n`;
        for (const k of testOnly) {
            const t = testAgg.get(k);
            md += `- [${shortFile(t.file)}] ${t.name}\n`;
        }
        md += `\n`;
    }
}

if (invalidComparisons.length > 0) {
    md += `## Skipped (invalid hz)\n\n`;
    md += `These benchmarks were excluded from the comparison because the base or test had a `;
    md += `non-positive or non-finite hz value.\n\n`;
    for (const c of invalidComparisons) {
        md += `- [${shortFile(c.file)}] ${c.name}: ${c.reason} (base=${c.baseHz}, test=${c.testHz})\n`;
    }
    md += `\n`;
}

if (
    raise.length > 0 ||
    reduceData.length > 0 ||
    thermalSuspect.length > 0 ||
    overSampled.length > 0 ||
    review.length > 0
) {
    md += `## Suggested noiseFactors\n\n`;
    md += `Noise floor this run (median rme): **±${noiseFloor.toFixed(2)}%** — only benches above ±${(noiseFloor * NOISE_FLOOR_RATIO).toFixed(2)}% are listed, so the rest sit at the run's baseline with no action to take. `;
    md += `Tuned to the **test** side; **base rme** is the thermal cross-check (noisy on both ⇒ real), `;
    md += `**spike** is p99/median (high ⇒ rare pauses, not broadband noise). Set with \`benchDefaults(…, factor)\`; \`pragmatic\` caps the bump at 4×.\n\n`;
    writeFactorTable(
        'Under-sampled (raise noiseFactor)',
        'Broadband noise (low spike) that base agrees is real — raise the factor (more samples tighten it), or improve the benchmark setup / grid code so the operation is less variable.',
        raise
    );
    writeFactorTable(
        'Spike-bound (reduce the dataset)',
        `Real noise (base agrees) but dominated by rare pauses (spike ≥ ${SPIKE_THRESHOLD}× p99/median) — GC/layout, not under-sampling. More samples barely help; shrink the dataset to cut the pauses.`,
        reduceData
    );
    writeFactorTable(
        'Test-only noise (likely thermal — re-run before adjusting)',
        'Noisy on test but base was calm, so it’s probably a thermal fluke on this run rather than the bench. Confirm with another run before changing a factor.',
        thermalSuspect
    );
    writeFactorTable(
        'Outside the ideal band (review)',
        `Above the ${NOISE_BAND_HIGH}% band but pragmatic leaves them as-is — to tighten, reduce the dataset or set a manual factor.`,
        review
    );
    writeFactorTable(
        'Over-sampled benchmarks (lower noiseFactor to run faster)',
        `Already very precise (rme < ${NOISE_BAND_LOW}%); a factor < 1 runs them faster with ample precision.`,
        overSampled
    );
}

md += `---\n\n`;
const generatedAt = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }).replace(',', '');
md += `*Generated by bench-compare.mjs — ${runCountLabel}, weighted hz, ${generatedAt} (UK)*\n`;

writeFileSync(mdPath, md);

// ── Console summary ──

console.log('Results written to:');
console.log(`  ${jsonPath}`);
console.log(`  ${mdPath}`);
const tooNoisy = tuning.filter((t) => t.rme >= RME_HIGH_PCT).length;
const overSampledCount = tuning.filter((t) => t.rme <= RME_LOW_PCT).length;
if (tooNoisy > 0 || overSampledCount > 0) {
    console.log(
        `\n⚙️  noiseFactor: ${tooNoisy} bench(es) ≥ ${RME_HIGH_PCT}% (raise), ${overSampledCount} ≤ ${RME_LOW_PCT}% ` +
            `(lower to run faster). See the report's "Suggested noiseFactors" table.`
    );
}
console.log(`\n=== Summary (${runCountLabel}, weighted hz) ===`);

function printNotableLine(c) {
    const arrow = c.delta > 0 ? '↑' : '↓';
    const result = fmtSpeedup(c);
    console.log(
        `  ${arrow} ${result.padStart(16)}  [${shortFile(c.file)}] ${c.name}  (${fmtHz(c.baseHz)} → ${fmtHz(c.testHz)} ops/s)`
    );
}

if (notable.length > 0) {
    if (notableCertain.length > 0) {
        console.log(`\n-- Certain (outside margin of error) --`);
        for (const c of notableCertain) {
            printNotableLine(c);
        }
    }
    if (notableNoisy.length > 0) {
        console.log(`\n-- Noisy (delta within margin of error) --`);
        for (const c of notableNoisy) {
            printNotableLine(c);
        }
        console.log(`\n  ${notableNoisy.length} of ${notable.length} notable change(s) are within noise.`);
    }
} else {
    console.log('  No notable changes detected.');
}
