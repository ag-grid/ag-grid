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
 *   node bench-compare.mjs all [dir] [options]     Run base and test paired in time, then compare
 *
 * `all` runs both sides at once, taking turns per bench through a local turn server, then reruns in fresh processes
 * what one round could not settle; how it judges a bench is in .rulesync/rules/benchmarks.md ("Comparing runs").
 *
 * Defaults:
 *   base dir: <parent>/ag-grid2
 *   test dir: <parent>/ag-grid
 *   results:  ./tmp/   (relative to this script)
 *
 * Options:
 *   --runs <n>        Rounds `all` may run (default 3), and above 1 two more for a slower lean. 1 is a screen,
 *                     reported at whatever confidence one round gives. base/test always run one round.
 *   --all-rounds      Run every bench in every round (to seed the noise history or validate the screen).
 *   --filter <glob>   Filter benchmark files (forwarded to vitest bench). Repeatable, and the run covers
 *                     the union: `--filter scroll --filter column-update`.
 *   --output <path>   Output directory for results (default: ./tmp)
 *
 * Files written to the output directory (a `--filter`ed run is incomplete, so its files gain a
 * `-partial` suffix — base-run-1-partial.json, base-meta-partial.json, bench-compare-result-partial.md
 * — to keep them distinct from a full comparison; pass the same `--filter` to `compare`):
 *   base-run-<n>.json         Raw vitest bench output for base round <n> (one file per round).
 *   base-run-<n>.samples.ndjson  Every measured call's time per bench and slice for that round.
 *   test-run-<n>.json         Same, for the test side (and test-run-<n>.samples.ndjson).
 *   base-meta.json            Cohort metadata: engine, filter, run files, pairing, etc.
 *   bench-compare-result.json Machine-readable comparison: per-benchmark result, confidence, times per
 *                             call, rounds, and unmatched benchmarks.
 *   bench-compare-result.md   Human-readable report: the faster/slower table, then every benchmark by file.
 *   process-noise.json        Between-process noise observations for this machine/engine.
 *   round-confirmations.json  Round-1 flags per run and whether a later round upheld them.
 *
 * Examples:
 *   node bench-compare.mjs all                     # Measure base and test paired, then compare
 *   node bench-compare.mjs base ~/other-grid       # Measure a custom base checkout
 *   node bench-compare.mjs all --runs 1 --filter "getvalue"   # Screen only
 *   node bench-compare.mjs all --all-rounds --runs 3          # Seed the noise history
 */
import { spawn, spawnSync } from 'node:child_process';
import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import os from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
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
  node bench-compare.mjs all [dir] [options]     Run base [dir] and test paired in time, then compare
  node bench-compare.mjs backup [options]        Archive the current results into a timestamped subfolder

Both sides always run THIS checkout's benchmark files; base/test [dir] only selects which checkout's
grid source (packages/) they measure. So the comparison can never drift on differing bench definitions.

all runs the two sides at once, taking turns per bench (which side goes first alternates by round), so
drift lands on both sides alike. Each bench is the likeliest of faster, slower or same (under 2%), with
that likelihood as its confidence. Round 1 runs every bench; later rounds rerun, in fresh processes, the
changes and what more runs could settle or change.

Options:
  --runs <n>         Rounds all may run (default 3; above 1, two more for a slower lean; 1 = screen only)
  --all-rounds       Every bench in every round (seeds the noise history, validates the screen)
  --filter <glob>    Filter benchmark files (repeatable; the run covers the union)
  --output <path>    Results directory (default: ./tmp)

Files written to the output directory (a --filter'ed run is incomplete, so its files gain a
"-partial" suffix, e.g. bench-compare-result-partial.md; pass the same --filter to "compare"):
  base-run-<n>.json            Raw vitest output for base round <n> (one per round).
  test-run-<n>.json            Raw vitest output for test round <n> (one per round).
  <side>-run-<n>.samples.ndjson  Every measured call's time per bench and slice.
  bench-compare-result.json    Structured comparison (result, confidence, times per call, rounds).
  bench-compare-result.md      Human-readable report (faster/slower table, then every benchmark).
  process-noise.json           Between-process noise learned on this machine/engine.
  round-confirmations.json     Round-1 flags per run and whether a later round upheld them.`);
    process.exit(command ? 0 : 1);
}

if (!['base', 'test', 'compare', 'all', 'backup'].includes(command)) {
    console.error(`Unknown command: ${command}. Use 'base', 'test', 'compare', 'all' or 'backup'.`);
    process.exit(1);
}

let runs = 0;
let allRounds = false;
const filters = [];
let outputDir = join(__dirname, 'tmp');
let targetDir = '';

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
        case '--all-rounds':
            allRounds = true;
            break;
        case '--filter':
            // Repeatable: vitest takes several file-path substrings and runs their union.
            filters.push(takeValue('--filter', args, i++));
            break;
        case '--output':
            outputDir = resolve(takeValue('--output', args, i++));
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

// A bench leaning slower may run this many rounds past --runs: a slowdown gets investigated, so one is reported only
// once more rounds have confirmed it or pulled it back to the same.
const SLOWER_EXTRA_ROUNDS = 2;

// Only a paired `all` can adapt: base/test have nothing to compare against mid-run.
const adaptive = command === 'all';
if (!adaptive && (runs > 1 || allRounds)) {
    console.warn(`--runs and --all-rounds are ignored here: only a paired \`all\` runs confirmation rounds.`);
}
runs = adaptive ? runs || 3 : 1;

// A filtered run only covers some benchmarks, so its outputs are tagged `-partial` to keep them
// distinct from a complete comparison's files (and from each other). Pass the same `--filter` to
// the `compare` command to read the partial cohort back.
const isPartial = filters.length > 0;
const partialSuffix = isPartial ? '-partial' : '';

/** Sorted so two cohorts given the same filters in a different order still compare equal. */
const filter = filters.slice().sort().join(' ');

// Benchmarks to exclude — these depend on DOM rendering and produce
// unreliable results that vary between environments.
const EXCLUDED_BENCH_FILES = ['modules.bench'];

// Resolve target directory defaults: base is the sibling baseline checkout, test is THIS checkout
// (so it works from any folder name / worktree, not just one literally named `ag-grid`).
if (!targetDir && command === 'test') {
    targetDir = MONOREPO_ROOT;
}
if (!targetDir && (command === 'base' || command === 'all')) {
    targetDir = resolve(SIBLING_PARENT, 'ag-grid2');
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
        engine: 'browser',
        node: process.version,
        chromium: await chromiumVersion(),
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

/** Read a JSON file, or null when it is missing or unreadable. */
function readJsonOrNull(path) {
    if (!existsSync(path)) {
        return null;
    }
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return null;
    }
}

/** Copy a child's output to ours line by line behind a side prefix, so two concurrent sides stay readable. */
function pipePrefixed(stream, out, prefix) {
    createInterface({ input: stream, crlfDelay: Infinity }).on('line', (line) => out.write(`${prefix}${line}\n`));
}

/**
 * Run vitest bench once. Resolves to the process exit status (0 = clean, non-zero = some benchmark
 * errored — e.g. a feature absent in this checkout — which is NOT necessarily fatal), or null only
 * when the benchmark could not be launched at all. The caller decides whether the run is usable by
 * inspecting the output file, not by trusting the exit code alone. A paired side passes its turn
 * env and an output prefix.
 */
function runBenchmarks(projectDir, outputFile, sideEnv, prefix, selection) {
    // Always run THIS checkout's bench code, but alias the grid packages to the checkout being
    // measured (projectDir). Both sides share identical benchmark definitions; only the grid source
    // under test differs.
    if (!existsSync(join(projectDir, 'packages'))) {
        console.error(`Error: ${join(projectDir, 'packages')} does not exist.`);
        return Promise.resolve(null);
    }

    const benchArgs = ['vitest', 'bench', '--outputJson', outputFile];
    for (const ex of EXCLUDED_BENCH_FILES) {
        benchArgs.push('--exclude', `**/${ex}*`);
    }
    if (selection) {
        benchArgs.push('-t', selection.pattern, ...selection.files);
    } else {
        benchArgs.push(...filters);
    }

    console.log(`${prefix}  Dir: ${projectDir}`);
    console.log(`${prefix}  Running: npx ${benchArgs.join(' ')}\n`);

    const { cmd, args: spawnArgs } = caffeinated('npx', benchArgs);
    const child = spawn(cmd, spawnArgs, {
        cwd: BEHAVIOURAL_DIR,
        stdio: prefix ? ['ignore', 'pipe', 'pipe'] : 'inherit',
        env: {
            ...process.env,
            NX_DAEMON: 'false',
            AG_BENCH_PACKAGES: join(projectDir, 'packages'),
            ...sideEnv,
        },
    });
    if (prefix) {
        pipePrefixed(child.stdout, process.stdout, prefix);
        pipePrefixed(child.stderr, process.stderr, prefix);
    }
    return new Promise((resolvePromise) => {
        child.on('error', () => resolvePromise(null));
        child.on('close', (status) => {
            if (status !== 0) {
                console.warn(
                    `\n${prefix}  vitest exited non-zero (${status}) — some benchmarks errored; inspecting output.`
                );
            }
            resolvePromise(status);
        });
    });
}

const isMeasured = (entry) => entry !== undefined && Number.isFinite(entry.hz) && entry.hz > 0;

/**
 * Parse a freshly-written run file and classify each benchmark as valid (finite, positive hz) or
 * invalid (errored / not measurable — typically a feature absent in this checkout). Returns null
 * when the file is unusable (missing, unparseable, or zero valid benchmarks) — that's a real
 * failure that must abort the cohort, as opposed to a feature-missing benchmark we can skip.
 */
function inspectRunFile(path) {
    const parsed = readJsonOrNull(path);
    if (!parsed || !Array.isArray(parsed.files)) {
        return null;
    }
    const valid = [];
    const invalid = [];
    for (const file of parsed.files) {
        for (const group of file.groups ?? []) {
            for (const bench of group.benchmarks ?? []) {
                if (isMeasured(bench)) {
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

const uniqueId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Stamp a run file with its cohort identity so `compare` can reject stale / cross-cohort files. */
function stampRunFile(path, parsed, stamp) {
    parsed.__benchCompare = stamp;
    writeFileSync(path, JSON.stringify(parsed));
}

// ── Run phase ──

/**
 * Build one side's cohort in `dir`. Returns `writeMeta(completed, extra)` and `runOne(i, …)` so
 * callers can drive the runs — sequentially (`base`/`test`) or paired in time (`all`).
 */
function createSide(label, sideTargetDir, env, dir) {
    // Unique id binding every run file in this cohort to its meta. `compare` refuses to load a run
    // file whose stamp doesn't match — so a stale file left over from an interrupted previous run
    // (different checkout / build) can never be silently averaged in again.
    const cohortId = `${label}-${uniqueId()}`;
    const git = gitInfo(sideTargetDir);
    const metaPath = join(dir, `${label}-meta${partialSuffix}.json`);
    // Only rounds that completed: a confirmation round runs when the previous one left benches unsettled.
    const cohortFiles = [];
    const sampleFiles = [];
    // Cumulative wall-clock of this side's vitest runs, recorded in the meta.
    let durationMs = 0;
    // ISO time the last run of this side actually finished — the side's own "max run date". Set only
    // after a run succeeds, so an interrupted later run can't poison it (unlike the meta write time).
    let lastRunAt = '';

    // The `compare` phase reads both sides' metadata to (a) refuse incompatible settings (filter,
    // engine, exclude list), (b) load only the declared run files, and (c) reject incomplete or
    // mismatched-cohort files. We write meta up-front with completed:false so an interrupted run
    // is detectable, then rewrite completed:true only once every run has produced usable output.
    function writeMeta(completed, extra) {
        writeFileSync(
            metaPath,
            JSON.stringify(
                {
                    label,
                    cohortId,
                    completed,
                    engine: 'browser',
                    partial: isPartial,
                    filter,
                    excludedFiles: EXCLUDED_BENCH_FILES,
                    maxRounds: runs,
                    runFiles: cohortFiles,
                    sampleFiles,
                    targetDir: sideTargetDir,
                    git,
                    env,
                    durationMs,
                    lastRunAt,
                    ...extra,
                    timestamp: new Date().toISOString(),
                },
                null,
                2
            )
        );
    }

    /** Throws when the run is unusable; a paired caller must let the other side finish first. */
    async function runOne(i, sideEnv = {}, prefix = '', selection = null) {
        const runFile = `${label}-run-${i}${partialSuffix}.json`;
        const samplesFile = `${label}-run-${i}${partialSuffix}.samples.ndjson`;
        const outFile = join(dir, runFile);
        // A run that dies before writing its output must not leave an earlier invocation's file to be adopted.
        rmSync(outFile, { force: true });
        console.log(`${prefix}--- ${label} round ${i} (${sideTargetDir}) ---`);
        // Stamped like the run file, so compare can tell a stale samples file from this round's.
        const samplesPath = join(dir, samplesFile);
        writeFileSync(samplesPath, `${JSON.stringify({ cohortId })}\n`);
        const runEnv = { ...sideEnv, AG_BENCH_SAMPLES: samplesPath };
        const start = Date.now();
        const status = await runBenchmarks(sideTargetDir, outFile, runEnv, prefix, selection);
        durationMs += Date.now() - start;
        if (status === null) {
            throw new Error(`${label} benchmark could not be launched at run ${i}, aborting.`);
        }

        // Decide usability from the output, not the exit code: a non-zero exit caused only by a
        // feature-missing benchmark still leaves a fully usable file for everything else.
        const inspected = inspectRunFile(outFile);
        if (!inspected) {
            throw new Error(
                `${label} run ${i} produced no usable benchmark results (vitest exit ${status}). ` +
                    `This is a real failure (build/import error), not a missing feature. Aborting.`
            );
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
        cohortFiles.push(runFile);
        sampleFiles.push(samplesFile);
        lastRunAt = new Date().toISOString();
    }

    return { writeMeta, runOne, getDurationMs: () => durationMs };
}

/** Format a millisecond duration as a short human string (e.g. "4.1s", "1m 12s"). */
function fmtDuration(ms) {
    const s = ms / 1000;
    if (s < 60) {
        return `${s.toFixed(1)}s`;
    }
    // Rounded before splitting, so 539.6s is 9m 0s rather than 8m 60s.
    const whole = Math.round(s);
    return `${Math.floor(whole / 60)}m ${whole % 60}s`;
}

// ── Turn server: pairs the two sides in time ──

// How long a side may run without asking for its next turn before the other is let go anyway — a
// hung side must not deadlock the pair. Starting covers Vite's first dependency optimisation.
const TURN_STALL_MS = { starting: 600_000, running: 300_000 };
// A wait is answered within this, so neither fetch nor the browser→node RPC ever times it out.
const TURN_POLL_MS = 20_000;

/**
 * Local HTTP server the two vitest processes ask for turns (via the `benchTurn` browser command).
 * Only a side holding the turn runs: it keeps it from its grant until it asks for its next bench, so
 * its untimed work (teardown, next file's import) also runs while the other side is idle.
 */
async function startTurnServer(firstPair) {
    const newSide = () => ({
        state: 'starting',
        stalled: false,
        since: Date.now(),
        key: '',
        granted: false,
        waiter: null,
        seen: new Set(),
    });
    const base = newSide();
    const test = newSide();
    const sides = new Map([
        ['base', base],
        ['test', test],
    ]);
    // The side that did not run last goes next, so no side runs two benches back to back (that measured ~10%
    // slower on micro-benches: no idle time for V8's GC); which side starts each bench alternates by round.
    let lastRan = firstPair % 2 === 0 ? test : base;
    let overtaken = 0;

    function answer(side, granted) {
        const waiter = side.waiter;
        if (waiter) {
            side.waiter = null;
            clearTimeout(waiter.timer);
            waiter.res.end(JSON.stringify({ granted }));
        }
    }

    /** The side that did not run last, else whichever side is behind the other. */
    function pickNext() {
        if (base.key === test.key) {
            return lastRan === base ? test : base;
        }
        if (base.seen.has(test.key)) {
            return test;
        }
        if (test.seen.has(base.key)) {
            return base;
        }
        // Neither reached the other's bench (one skipped a failed file or suite): files run in the sequencer's
        // order; within one file nothing says which side is behind, so those benches may run unpaired.
        return test.key.split('::')[0].localeCompare(base.key.split('::')[0]) < 0 ? test : base;
    }

    function schedule() {
        const now = Date.now();
        const waiting = [];
        let stalled = null;
        for (const side of sides.values()) {
            if (side.state === 'waiting') {
                waiting.push(side);
            } else if (side.state !== 'done' && !side.stalled) {
                if (now - side.since < TURN_STALL_MS[side.state]) {
                    return;
                }
                stalled = side;
            }
        }
        if (waiting.length === 0) {
            return;
        }
        const next = waiting.length === 2 ? pickNext() : waiting[0];
        if (stalled) {
            // Not busy again until it next asks for a turn, or every later grant would wait out the limit too.
            stalled.stalled = true;
            overtaken++;
            console.warn(`\n  Turn server: a side has not asked for a turn in minutes; running the other unpaired.`);
        }
        lastRan = next;
        next.state = 'running';
        next.since = now;
        next.seen.add(next.key);
        next.granted = true;
        answer(next, true);
    }

    const server = createServer((req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const side = sides.get(url.searchParams.get('side'));
        res.setHeader('Content-Type', 'application/json');
        if (!side) {
            res.statusCode = 400;
            res.end('{}');
            return;
        }
        if (url.pathname === '/request') {
            side.state = 'waiting';
            side.stalled = false;
            side.since = Date.now();
            side.key = url.searchParams.get('key') ?? '';
            side.granted = false;
            res.end('{}');
            schedule();
            return;
        }
        if (side.granted) {
            res.end(JSON.stringify({ granted: true }));
            return;
        }
        answer(side, false);
        side.waiter = { res, timer: setTimeout(() => answer(side, false), TURN_POLL_MS) };
    });
    await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
    const watchdog = setInterval(schedule, 1000);

    return {
        url: `http://127.0.0.1:${server.address().port}`,
        sideDone(label) {
            const side = sides.get(label);
            side.state = 'done';
            answer(side, false);
            schedule();
        },
        close() {
            clearInterval(watchdog);
            answer(base, false);
            answer(test, false);
            server.close();
        },
        /** Benches both sides reached, those only one side reached, and forced overtakes. */
        stats() {
            const unpaired = [];
            let paired = 0;
            for (const key of base.seen) {
                if (test.seen.has(key)) {
                    paired++;
                } else {
                    unpaired.push(key);
                }
            }
            for (const key of test.seen) {
                if (!base.seen.has(key)) {
                    unpaired.push(key);
                }
            }
            return { paired, unpaired, overtaken };
        },
    };
}

/** One round of both sides at once, taking turns per bench. Rejects only after both processes are gone. */
async function runPairedRound(base, test, i, selection) {
    const turns = await startTurnServer(i - 1);
    const sideEnv = (label) => ({ AG_BENCH_SIDE: label, AG_BENCH_TURN_URL: turns.url });
    const results = await Promise.allSettled([
        base.runOne(i, sideEnv('base'), '[base] ', selection).finally(() => turns.sideDone('base')),
        test.runOne(i, sideEnv('test'), '[test] ', selection).finally(() => turns.sideDone('test')),
    ]);
    turns.close();
    for (const result of results) {
        if (result.status === 'rejected') {
            throw result.reason;
        }
    }
    return turns.stats();
}

function round(v, decimals) {
    const f = 10 ** decimals;
    return Math.round(v * f) / f;
}

/** Run `compare` on `dir` in a child, so its report lands beside the runs it read. */
function spawnCompare(dir) {
    console.log(`\n========== bench-compare compare ==========`);
    const compareArgs = ['--output', dir];
    for (const each of filters) {
        compareArgs.push('--filter', each);
    }
    return spawnSync('node', [SELF, 'compare', ...compareArgs], { stdio: 'inherit' }).status ?? 1;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The benches the last compare left unsettled (all of them with --all-rounds), as a vitest selection. */
function nextRoundSelection(dir, roundIndex) {
    const result = readJsonOrNull(join(dir, `bench-compare-result${partialSuffix}.json`));
    const open = (result?.benchmarks ?? []).filter((c) => (allRounds && roundIndex <= runs) || !c.settled);
    if (open.length === 0) {
        return null;
    }
    // vitest's -t matches getTaskFullName: suites then bench, never the file (a top-level suite has no parent task),
    // so these anchored names select exactly them; the report's group name starts with the file, which is dropped.
    const names = open.map((c) => {
        const suites = c.group.split(' > ');
        if (suites[0] === c.file) {
            suites.shift();
        }
        suites.push(c.name);
        return `^${escapeRegExp(suites.join(' '))}$`;
    });
    return { files: [...new Set(open.map((c) => basename(c.file)))], pattern: names.join('|'), count: open.length };
}

try {
    if (command === 'base' || command === 'test') {
        console.log(`=== Running ${command} benchmarks ===`);
        console.log(`Directory:  ${targetDir}`);
        console.log(`Rounds:     1`);
        console.log(`Output:     ${outputDir}`);
        if (filter) {
            console.log(`Filter:     ${filter}`);
        }
        console.log(`Env:        real Chromium (Playwright)`);
        console.log('');

        ensurePlaywrightBrowsers();

        const env = await collectEnv();
        const side = createSide(command, targetDir, env, outputDir);
        side.writeMeta(false);
        await side.runOne(1);
        side.writeMeta(true);

        console.log(
            `\n=== ${command} benchmarks complete in ${fmtDuration(side.getDurationMs())} (saved to ${outputDir}) ===`
        );
        process.exit(0);
    }

    if (command === 'all') {
        const baseDir = targetDir;
        const testDir = MONOREPO_ROOT;
        console.log(`=== Running all — base and test paired per bench ===`);
        console.log(`Base:       ${baseDir}`);
        console.log(`Test:       ${testDir}`);
        const benches = allRounds ? 'every bench' : 'unsettled benches after the first';
        const slowerRounds = runs > 1 ? `, and ${SLOWER_EXTRA_ROUNDS} more for an unconfirmed slowdown` : '';
        console.log(`Rounds:     up to ${runs}, ${benches}${slowerRounds}`);
        console.log(`Output:     ${outputDir}`);
        console.log(`Env:        real Chromium (Playwright)`);
        console.log('');

        ensurePlaywrightBrowsers();

        const env = await collectEnv();
        const test = createSide('test', testDir, env, outputDir);
        const base = createSide('base', baseDir, env, outputDir);
        test.writeMeta(false);
        base.writeMeta(false);
        const wallStart = Date.now();
        // Both sides' metas carry it: their rounds were paired in time, so no shift between sessions lies between them.
        const session = uniqueId();
        let extra = { session };

        const unpaired = new Set();
        let paired = 0;
        let overtaken = 0;
        const roundWallMs = [];
        const roundLimit = runs > 1 ? runs + SLOWER_EXTRA_ROUNDS : runs;
        for (let i = 1; i <= roundLimit; i++) {
            const roundStart = Date.now();
            let selection = null;
            if (i > 1) {
                // Judge the rounds so far; a confirmation round reruns, in fresh processes, what is unsettled.
                test.writeMeta(true, extra);
                base.writeMeta(true, extra);
                if (spawnCompare(outputDir) !== 0) {
                    throw new Error(`compare failed after round ${i - 1}.`);
                }
                selection = nextRoundSelection(outputDir, i);
                if (!selection) {
                    console.log(`\n=== every bench settled after round ${i - 1} ===`);
                    break;
                }
                console.log(
                    `\n=== round ${i}: ${selection.count} unsettled bench(es) in ${selection.files.length} file(s) ===`
                );
            }
            const stats = await runPairedRound(base, test, i, selection);
            roundWallMs.push(Date.now() - roundStart);
            paired += stats.paired;
            overtaken += stats.overtaken;
            for (const key of stats.unpaired) {
                unpaired.add(key);
            }
            extra = {
                session,
                pairing: { paired, unpaired: [...unpaired], overtaken },
                wallMs: Date.now() - wallStart,
                roundWallMs,
            };
            console.log('');
        }
        extra.wallMs = Date.now() - wallStart;

        test.writeMeta(true, extra);
        base.writeMeta(true, extra);

        console.log(
            `\n=== runs complete in ${fmtDuration(extra.wallMs)} wall — test ${fmtDuration(test.getDurationMs())}, ` +
                `base ${fmtDuration(base.getDurationMs())} of process time ===`
        );
        process.exit(spawnCompare(outputDir));
    }
} catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
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
        results.push({ parsed, samples: loadSamples(label, meta, results.length) });
    }
    return results;
}

/** One round's `file::name#k` → its slices' calls, each `[time in 0.1µs, count, …]`; null when it recorded none. */
function loadSamples(label, meta, index) {
    const name = meta.sampleFiles?.[index];
    if (!name) {
        return null;
    }
    const path = join(outputDir, name);
    const lines = existsSync(path) ? readFileSync(path, 'utf-8').split('\n') : [];
    const stamp = lines[0] ? JSON.parse(lines[0]) : null;
    if (stamp?.cohortId !== meta.cohortId) {
        console.error(
            `Error: ${path} is missing or not part of the current ${label} cohort. ` +
                `Re-run "node bench-compare.mjs ${label}" to regenerate a clean cohort.`
        );
        process.exit(1);
    }
    const samples = new Map();
    for (let i = 1; i < lines.length; i++) {
        if (lines[i]) {
            const entry = JSON.parse(lines[i]);
            samples.set(entry[0], entry[1]);
        }
    }
    return samples;
}

function isExcluded(filepath) {
    return EXCLUDED_BENCH_FILES.some((ex) => filepath.includes(ex));
}

// Calls past Q3 + 3·IQR (Tukey's far-out fence) are GC/thermal pauses, not the operation. The IQR is
// floored at one timer step: a sub-step bench's calls sit on one or two values, and its steps are real time.
const FENCE_IQRS = 3;

/**
 * Plain and fenced mean (ms) of one slice's calls, from `[time in 0.1µs, count, …]` sorted ascending. The
 * fenced mean keeps both halves of a benchAlternating split, which a median would jump between.
 */
function callStats(runLengths) {
    let count = 0;
    let sum = 0;
    let step = Infinity;
    for (let i = 0; i < runLengths.length; i += 2) {
        count += runLengths[i + 1];
        sum += runLengths[i] * runLengths[i + 1];
        if (i > 0) {
            step = Math.min(step, runLengths[i] - runLengths[i - 2]);
        }
    }
    const q1 = valueAtRank(runLengths, Math.floor(count / 4));
    const q3 = valueAtRank(runLengths, Math.floor((3 * count) / 4));
    const fence = q3 + FENCE_IQRS * Math.max(q3 - q1, step === Infinity ? 0 : step);
    let kept = 0;
    let keptSum = 0;
    for (let i = 0; i < runLengths.length && runLengths[i] <= fence; i += 2) {
        kept += runLengths[i + 1];
        keptSum += runLengths[i] * runLengths[i + 1];
    }
    return { count, mean: sum / count / 1e4, fenced: keptSum / kept / 1e4 };
}

/** The call time at a 0-based rank of a sorted run-length list. */
function valueAtRank(runLengths, rank) {
    let seen = 0;
    for (let i = 0; i < runLengths.length; i += 2) {
        seen += runLengths[i + 1];
        if (rank < seen) {
            return runLengths[i];
        }
    }
    return runLengths[runLengths.length - 2];
}

/** One round's benches by key, each with its slices' call statistics when the round recorded them. */
function extractRound(round) {
    const map = new Map();
    for (const file of round.parsed.files) {
        if (isExcluded(file.filepath)) {
            continue;
        }
        const fileId = fileIdentity(file.filepath);
        // Same-named benches in one file are told apart by occurrence, as their turn keys are.
        const seen = new Map();
        for (const group of file.groups) {
            for (const bench of group.benchmarks) {
                const occurrence = (seen.get(bench.name) ?? 0) + 1;
                seen.set(bench.name, occurrence);
                const recorded = round.samples?.get(`${fileId}::${bench.name}#${occurrence}`);
                let slices = recorded ? recorded.map(callStats) : null;
                // A record whose call count disagrees with vitest's belongs to some other bench.
                if (slices && slices.reduce((n, slice) => n + slice.count, 0) !== bench.sampleCount) {
                    slices = null;
                }
                // Include fileId in the key — two files can legitimately share suite/bench names.
                map.set(`${fileId} :: ${group.fullName} > ${bench.name}`, {
                    name: bench.name,
                    group: group.fullName,
                    file: fileId,
                    hz: bench.hz,
                    mean: bench.mean,
                    rme: bench.rme,
                    sampleCount: bench.sampleCount,
                    slices,
                });
            }
        }
    }
    return map;
}

/** Per bench, its entry in every round of one side (a hole where that round lacks it). */
function collectSide(rounds) {
    const benches = new Map();
    for (let r = 0; r < rounds.length; r++) {
        for (const [key, data] of extractRound(rounds[r])) {
            let bench = benches.get(key);
            if (!bench) {
                bench = { name: data.name, group: data.group, file: data.file, rounds: [] };
                benches.set(key, bench);
            }
            bench.rounds[r] = data;
        }
    }
    return benches;
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
// Rounds pair by index, so the side with more rounds has its extra ones ignored.
const baseRunsCount = baseMeta.runFiles?.length ?? 0;
const testRunsCount = testMeta.runFiles?.length ?? 0;
if (baseRunsCount !== testRunsCount) {
    console.warn(
        `Warning: unequal round counts (base: ${baseRunsCount}, test: ${testRunsCount}). Only the first ` +
            `${Math.min(baseRunsCount, testRunsCount)} round(s) of each side are paired and compared.\n`
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
// Results from the retired node/happy-dom engine are not comparable with the browser's. `engine` is absent
// on legacy meta — tolerate that.
const baseEngine = baseMeta.engine;
const testEngine = testMeta.engine;
if (baseEngine && testEngine && baseEngine !== testEngine) {
    console.error(
        `Error: base and test were run with different engines (base: ${baseEngine}, test: ${testEngine}). ` +
            `Re-run both sides.`
    );
    process.exit(1);
}

const baseRuns = loadRuns('base', baseMeta);
const testRuns = loadRuns('test', testMeta);

const baseSide = collectSide(baseRuns);
const testSide = collectSide(testRuns);

// ── Statistics ──
//
// A round's delta is ln(base / test) from each side's slices; between processes it also moves by τ, or τ_out in an
// outlier pair. Student-t tails, an A/A self-check and the run's own z-spread keep the variance honest.

// Below FLOOR_PCT a change is too small to act on, however precisely it is measured: it is `same`.
const FLOOR_PCT = 2;
const FLOOR_LOG = Math.log(1 + FLOOR_PCT / 100);
// The share of unchanged benches and the scale of real changes, until a run has enough benches to fit its own,
// rounded from a fit on 150-bench runs (86%, 6.6%).
const DEFAULT_PRIOR = { unchanged: 0.85, scale: 0.06 };
// A result this likely is settled; later rounds rerun only what could still get there.
const SETTLED = 0.95;
// The two-sided 95% point: where a few slices' t tail is matched, and a `same` result's ± range.
const Z_975 = 1.96;
// Between-process noise until enough benches were seen in two process pairs, rounded from a fit on 438 held-out
// rounds (τ 2.9%, an outlier pair in 8% of rounds at 13.5%).
const DEFAULT_NOISE = { tau: 0.03, outlierShare: 0.08, outlierTau: 0.13 };
// Accounts with more outlier rounds than this are left out: at an outlier share of a tenth, each is 1000× rarer.
const MAX_OUTLIERS = 3;
// Fewer benches than this make a median or MAD across them too rough to trust.
const MIN_POOL = 10;
// The empirical null narrows intervals only from this many benches, and to no less than NULL_MIN_FACTOR.
const NULL_NARROW_POOL = 30;
const NULL_MIN_FACTOR = 0.5;
// The A/A self-check is calibrated where a tenth of its checks lie beyond, so a dozen of them set the scale, not the
// one or two most extreme checks of a run.
const SELF_CHECK_TARGET = 0.1;
const Z_SELF = 1.645;
const HISTORY_FILE = 'process-noise.json';
// Bumped when the history's shape changes: an older file is started afresh.
const HISTORY_VERSION = 2;
const RECORD_FILE = 'round-confirmations.json';
const HISTORY_COHORTS = 50;

const LOG_2PI = Math.log(2 * Math.PI);
const pctOf = (logRatio) => (Math.exp(logRatio) - 1) * 100;
const logNormal = (delta, sd) => -((delta / sd) ** 2) / 2 - Math.log(sd) - LOG_2PI / 2;

function logSumExp(values) {
    let top = -Infinity;
    for (const v of values) {
        top = Math.max(top, v);
    }
    let sum = 0;
    for (const v of values) {
        sum += Math.exp(v - top);
    }
    return top + Math.log(sum);
}

function median(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    return sorted[sorted.length >> 1];
}

/** Mean and sample variance (0 when fewer than 2 values). */
function meanAndVariance(values) {
    const n = values.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += values[i];
    }
    const mean = sum / n;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
        sumSq += (values[i] - mean) ** 2;
    }
    return { mean, variance: n > 1 ? sumSq / (n - 1) : 0 };
}

/** An estimate from log-ratios: its mean, and the variance of that mean with its df. */
function sliceEstimate(logRatios) {
    const { mean, variance } = meanAndVariance(logRatios);
    const n = logRatios.length;
    return { delta: mean, within: variance / n, df: n - 1 };
}

// From this many slices a side drops its fastest and slowest: a GC cycle or other brief disturbance lands in one
// slice, and a trimmed mean does not move with it.
const TRIM_FROM = 8;

/**
 * One side's slices: the trimmed mean of their log fenced means, its variance (Tukey–McLaughlin, from the
 * winsorised spread) and df.
 */
function sideEstimate(slices) {
    const logs = slices.map((slice) => Math.log(slice.fenced)).sort((a, b) => a - b);
    const n = logs.length;
    const trim = n >= TRIM_FROM ? 1 : 0;
    const kept = n - 2 * trim;
    const winsorised = logs.slice();
    for (let i = 0; i < trim; i++) {
        winsorised[i] = logs[trim];
        winsorised[n - 1 - i] = logs[n - 1 - trim];
    }
    let sum = 0;
    for (let i = trim; i < n - trim; i++) {
        sum += logs[i];
    }
    const variance = meanAndVariance(winsorised).variance;
    return { mean: sum / kept, variance: ((n - 1) * variance) / (kept * (kept - 1)), df: kept - 1 };
}

/**
 * One round of one bench. The two sides measured at different moments, so their slices are not paired: each
 * side is estimated on its own and the variances add (Welch). The self-check compares each side's two outer
 * slices with their inner neighbours, which linear drift reaches equally.
 */
function pairRound(b, t) {
    if (b.slices?.length >= 2 && t.slices?.length >= 2) {
        const base = sideEstimate(b.slices);
        const test = sideEstimate(t.slices);
        const within = base.variance + test.variance;
        const df = within > 0 ? within ** 2 / (base.variance ** 2 / base.df + test.variance ** 2 / test.df) : Infinity;
        let selfCheck = null;
        if (b.slices.length >= 4 && t.slices.length >= 4) {
            const selfRatios = [];
            for (const side of [b.slices, t.slices]) {
                const last = side.length - 1;
                selfRatios.push(
                    Math.log(side[0].fenced / side[1].fenced),
                    Math.log(side[last].fenced / side[last - 1].fenced)
                );
            }
            selfCheck = sliceEstimate(selfRatios);
        }
        const plainMean = (slices) => meanAndVariance(slices.map((slice) => Math.log(slice.mean))).mean;
        return {
            delta: base.mean - test.mean,
            within,
            df,
            meanDelta: plainMean(b.slices) - plainMean(t.slices),
            selfCheck,
            baseMs: Math.exp(base.mean),
        };
    }
    // No usable slices (a run file from before them, or a count mismatch): tinybench's mean and its 95% rme.
    const delta = Math.log(b.mean / t.mean);
    return {
        delta,
        within: ((b.rme / Z_975) ** 2 + (t.rme / Z_975) ** 2) / 1e4,
        df: Infinity,
        meanDelta: delta,
        selfCheck: null,
        baseMs: b.mean,
    };
}

/**
 * Student-t quantile for a standard-normal quantile `z` at `df` degrees of freedom (Cornish–Fisher, within 4% from
 * 3 df). A spread from a few slices understates the noise as often as not, and t pays for that in the tails.
 */
function tQuantile(z, df) {
    if (!Number.isFinite(df)) {
        return z;
    }
    const z3 = z ** 3;
    const z5 = z ** 5;
    const z7 = z ** 7;
    return (
        z +
        (z3 + z) / (4 * df) +
        (5 * z5 + 16 * z3 + 3 * z) / (96 * df ** 2) +
        (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df ** 3)
    );
}

// Report unmatched benchmarks
const baseOnly = [...baseSide.keys()].filter((k) => !testSide.has(k));
const testOnly = [...testSide.keys()].filter((k) => !baseSide.has(k));
if (baseOnly.length > 0) {
    console.log(`Note: ${baseOnly.length} benchmark(s) only in base (removed or renamed?):`);
    for (const k of baseOnly) {
        console.log(`  - ${baseSide.get(k).name}`);
    }
}
if (testOnly.length > 0) {
    console.log(`Note: ${testOnly.length} benchmark(s) only in test (added or renamed?):`);
    for (const k of testOnly) {
        console.log(`  - ${testSide.get(k).name}`);
    }
}

// Each bench's rounds, from those both sides measured.
const comparisons = [];
const invalidComparisons = [];
for (const [key, base] of baseSide) {
    const test = testSide.get(key);
    if (!test) {
        continue;
    }
    const rounds = [];
    let baseCalls = Infinity;
    let testCalls = Infinity;
    const roundCount = Math.min(base.rounds.length, test.rounds.length);
    for (let r = 0; r < roundCount; r++) {
        const b = base.rounds[r];
        const t = test.rounds[r];
        if (isMeasured(b) && isMeasured(t)) {
            rounds.push({ round: r + 1, ...pairRound(b, t) });
            baseCalls = Math.min(baseCalls, b.sampleCount);
            testCalls = Math.min(testCalls, t.sampleCount);
        }
    }
    if (rounds.length === 0) {
        // Zero / non-finite hz on a side (an errored bench) would yield Infinity/NaN in the delta.
        invalidComparisons.push({ key, name: base.name, group: base.group, file: base.file });
        continue;
    }
    comparisons.push({ key, name: base.name, group: base.group, file: base.file, rounds, baseCalls, testCalls });
}

// Each round's own slice spread is its within-run variance: calls within a slice are neither independent (GC
// cycles) nor alike (an alternating or cycling bench), so no call-level model predicts it. It is widened to the
// normal variance with the same 97.5% tail as t at its df.
const roundEstimates = comparisons.flatMap((c) => c.rounds);
for (const e of roundEstimates) {
    e.within *= (tQuantile(Z_975, e.df) / Z_975) ** 2;
}
const selfChecks = roundEstimates.map((e) => e.selfCheck).filter(Boolean);

// Self-check: A/A intervals that miss 0 should be SELF_CHECK_TARGET of them; if more do, the within-run variance is
// too small by the factor that brings the miss rate back to target, and every bench's within-run variance is scaled
// by it. Each t is mapped onto the normal scale at the same tail.
// A check with no spread (identical ratios) has no scale to test.
const selfZ = selfChecks
    .filter((e) => e.within > 0)
    .map((e) => (Math.abs(e.delta) / Math.sqrt(e.within)) * (Z_SELF / tQuantile(Z_SELF, e.df)))
    .sort((a, b) => b - a);
const selfOutside = selfZ.filter((z) => z > Z_SELF).length;
const selfAllowed = Math.floor(SELF_CHECK_TARGET * selfZ.length);
const selfFactor = selfZ.length >= MIN_POOL && selfOutside > selfAllowed ? selfZ[selfAllowed] / Z_SELF : 1;
for (const e of roundEstimates) {
    e.within *= selfFactor ** 2;
}

// ── Between-process noise: a machine-wide mixture, learned from this run's benches seen in two or more rounds ──
//
// A bench's spread in one run does not predict its next, so a round is ordinary (±τ) or, at the outlier share, an
// outlier (±τ_out), and a bench's rounds weigh each way of accounting for them by how well they then agree.

/** Machine + engine identity the history is valid for; node version and time of day don't matter. */
function machineFingerprint(env) {
    return JSON.stringify([env?.engine, env?.chromium, env?.cpu, env?.cpuCount, env?.os]);
}

// A bench seen in two process pairs: each round's delta and within-run variance.
const runObservations = {};
for (const c of comparisons) {
    if (c.rounds.length > 1) {
        runObservations[c.key] = c.rounds.map((e) => [e.delta, e.within]);
    }
}

const cohortKey = `${baseMeta.cohortId}+${testMeta.cohortId}`;

/** The HISTORY_COHORTS most recent cohorts, so a per-machine file stops growing. */
function newestCohorts(cohorts) {
    const kept = Object.entries(cohorts)
        .sort((a, b) => (a[1].at < b[1].at ? 1 : -1))
        .slice(0, HISTORY_COHORTS);
    return Object.fromEntries(kept);
}
const fingerprint = machineFingerprint(baseMeta.env ?? testMeta.env);
const historyPath = join(outputDir, HISTORY_FILE);
const storedHistory = readJsonOrNull(historyPath);
const history =
    storedHistory?.fingerprint === fingerprint && storedHistory.version === HISTORY_VERSION
        ? storedHistory
        : { fingerprint, version: HISTORY_VERSION, cohorts: {} };
if (Object.keys(runObservations).length) {
    // Keyed by cohort, so comparing the same runs again replaces their observations instead of counting twice.
    history.cohorts[cohortKey] = { at: new Date().toISOString(), benches: runObservations };
    history.cohorts = newestCohorts(history.cohorts);
    writeFileSync(historyPath, JSON.stringify(history));
}

const noiseModel = ({ tau, outlierShare, outlierTau }) => ({
    tau,
    outlierShare,
    outlierTau,
    tau2: tau * tau,
    outlierTau2: outlierTau * outlierTau,
    logOrdinary: Math.log(1 - outlierShare),
    logOutlier: Math.log(outlierShare),
});

const outlierMaskCache = [];
/** Ascending masks of `k` rounds with at most MAX_OUTLIERS set, so a long run never walks all 2^k. */
function outlierMasks(k) {
    let masks = outlierMaskCache[k];
    if (!masks) {
        masks = [0];
        const counts = [0];
        // Each mask grows by one outlier above its highest, so every mask is built exactly once.
        for (let j = 0; j < masks.length; j++) {
            if (counts[j] < MAX_OUTLIERS) {
                for (let bit = 32 - Math.clz32(masks[j]); bit < k; bit++) {
                    masks.push(masks[j] | (1 << bit));
                    counts.push(counts[j] + 1);
                }
            }
        }
        masks.sort((a, b) => a - b);
        outlierMaskCache[k] = masks;
    }
    return masks;
}

/**
 * Every way a bench's rounds can be ordinary or outliers (up to MAX_OUTLIERS outliers, the all-ordinary way first):
 * each way's inverse-variance estimate and its weight, the way's prior times how well the rounds agree under it, θ
 * integrated out. `scale` multiplies every variance.
 */
function mixtureOf(rounds, noise, scale = 1) {
    const k = rounds.length;
    const components = [];
    const variances = new Array(k);
    const masks = outlierMasks(k);
    for (let j = 0; j < masks.length; j++) {
        const mask = masks[j];
        let outliers = 0;
        let weights = 0;
        let delta = 0;
        let meanDelta = 0;
        let logVariances = 0;
        for (let i = 0; i < k; i++) {
            const outlier = (mask >> i) & 1;
            outliers += outlier;
            const v = scale * (rounds[i].within + (outlier ? noise.outlierTau2 : noise.tau2));
            variances[i] = v;
            weights += 1 / v;
            delta += rounds[i].delta / v;
            meanDelta += rounds[i].meanDelta / v;
            logVariances += Math.log(v);
        }
        delta /= weights;
        let misfit = 0;
        for (let i = 0; i < k; i++) {
            misfit += (rounds[i].delta - delta) ** 2 / variances[i];
        }
        const logPrior = outliers * noise.logOutlier + (k - outliers) * noise.logOrdinary;
        const logWeight = logPrior - misfit / 2 - logVariances / 2 - ((k - 1) * LOG_2PI) / 2 - Math.log(weights) / 2;
        components.push({ logWeight, delta, meanDelta: meanDelta / weights, variance: 1 / weights });
    }
    const logMarginal = logSumExp(components.map((c) => c.logWeight));
    for (const c of components) {
        c.weight = Math.exp(c.logWeight - logMarginal);
    }
    return { components, logMarginal };
}

/** The mixture as one estimate (its mean and variance), for display and a projection of later rounds. */
function summaryOf(components) {
    let delta = 0;
    let meanDelta = 0;
    let second = 0;
    for (const c of components) {
        delta += c.weight * c.delta;
        meanDelta += c.weight * c.meanDelta;
        second += c.weight * (c.variance + c.delta ** 2);
    }
    return { delta, meanDelta, variance: second - delta ** 2 };
}

/** τ, the outlier share and τ_out that make the observed benches' rounds likeliest (coordinate ascent). */
function fitNoise(benches) {
    if (benches.length < NULL_NARROW_POOL) {
        return { ...DEFAULT_NOISE, fitted: false };
    }
    const logLikelihood = (params) => {
        const noise = noiseModel(params);
        let sum = 0;
        for (const rounds of benches) {
            sum += mixtureOf(rounds, noise).logMarginal;
        }
        return sum;
    };
    // An outlier must be one: τ_out at least twice τ, or the two would trade places.
    const valid = (p) =>
        p.tau >= 0.002 && p.outlierTau >= 2 * p.tau && p.outlierShare >= 0.005 && p.outlierShare <= 0.5;
    let best = DEFAULT_NOISE;
    let bestLogLikelihood = logLikelihood(best);
    for (let step = 1.5; step > 1.01; step = Math.sqrt(step)) {
        let moved = true;
        while (moved) {
            moved = false;
            for (const field of ['tau', 'outlierTau', 'outlierShare']) {
                for (const factor of [step, 1 / step]) {
                    const next = { ...best, [field]: best[field] * factor };
                    if (valid(next)) {
                        const nextLogLikelihood = logLikelihood(next);
                        if (nextLogLikelihood > bestLogLikelihood) {
                            best = next;
                            bestLogLikelihood = nextLogLikelihood;
                            moved = true;
                        }
                    }
                }
            }
        }
    }
    return { ...best, fitted: true };
}

const observedBenches = [];
for (const cohort of Object.values(history.cohorts)) {
    for (const rounds of Object.values(cohort.benches)) {
        observedBenches.push(rounds.map(([delta, within]) => ({ delta, within, meanDelta: delta })));
    }
}
const fittedNoise = fitNoise(observedBenches);
const noise = noiseModel(fittedNoise);

// Separate sessions differ by the machine's heat (a round can shift 18%), which only pairing in time cancels: the
// run-wide median shift is taken out, so a change that moves every bench alike shows only in that shift.
const paired = Boolean(baseMeta.session) && baseMeta.session === testMeta.session;
const shiftTaken = !paired && comparisons.length >= MIN_POOL;
const sessionShift = shiftTaken ? median(comparisons.map((c) => median(c.rounds.map((e) => e.delta)))) : 0;
for (const e of roundEstimates) {
    e.delta -= sessionShift;
    e.meanDelta -= sessionShift;
}

// Empirical null: in an A/B most benches don't change, so the run's own z-scores show its real noise, either
// way: on A/A runs the slice and τ model over-covered ~2×. Outliers are the mixture's, so the all-ordinary
// account is measured, and every variance is then scaled by it.
const zScores = comparisons.map((c) => {
    const core = mixtureOf(c.rounds, noise).components[0];
    return core.delta / Math.sqrt(core.variance);
});
const zCentre = zScores.length ? median(zScores) : 0;
const nullFloor = zScores.length >= NULL_NARROW_POOL ? NULL_MIN_FACTOR : 1;
const nullFactor =
    zScores.length >= MIN_POOL ? Math.max(nullFloor, 1.4826 * median(zScores.map((z) => Math.abs(z - zCentre)))) : 1;
const nullScale = nullFactor ** 2;

for (const c of comparisons) {
    c.mixture = mixtureOf(c.rounds, noise, nullScale).components;
    c.all = summaryOf(c.mixture);
    c.core = c.mixture[0];
    c.firstMixture = c.rounds[0].round === 1 ? mixtureOf([c.rounds[0]], noise, nullScale).components : null;
}

// ── Result: the likeliest of faster / slower / same ──
//
// A bench's true change θ is 0 if unchanged, else Laplace(scale), and its estimate adds normal noise. The run's
// estimates fit the unchanged share and scale by maximum likelihood; each posterior splits at ±floor.

/** log of the slab's mass in each region, over θ within ±8 sd of the estimate (a sd/10 grid); one shared offset. */
function slabLogMass(delta, sd, scale) {
    const step = sd / 10;
    // Factored out of every weight, so a far estimate's tiny density does not underflow to 0.
    const offset = -Math.abs(delta) / scale;
    let faster = 0;
    let slower = 0;
    let same = 0;
    for (let k = -80; k <= 80; k++) {
        const theta = delta + k * step;
        const weight = Math.exp(-(k * k) / 200 - offset - Math.abs(theta) / scale);
        if (theta > FLOOR_LOG) {
            faster += weight;
        } else if (theta < -FLOOR_LOG) {
            slower += weight;
        } else {
            same += weight;
        }
    }
    // × step / (2 scale) for the Laplace density and its grid, × 1 / (sd √2π) for the normal likelihood.
    const base = offset + Math.log(step / (2 * scale)) - Math.log(sd) - LOG_2PI / 2;
    return { faster, slower, same, base };
}

/** The unchanged spike's log likelihood and the slab's, for one estimate. */
function logLikelihoods(delta, sd, prior) {
    const slab = slabLogMass(delta, sd, prior.scale);
    const spike = Math.log(prior.unchanged) + logNormal(delta, sd);
    return { spike, slab, changed: Math.log(1 - prior.unchanged) + slab.base };
}

const sdOf = (variance) => Math.max(1e-9, Math.sqrt(variance));

/** The unchanged share and change scale that make the run's mixtures likeliest; the default for a small run. */
function fitPrior(mixtures) {
    if (mixtures.length < NULL_NARROW_POOL) {
        return { ...DEFAULT_PRIOR, fitted: false };
    }
    // A component's weight, noise and spike likelihood do not depend on the prior, so they are computed once.
    const parts = mixtures.map((mixture) =>
        mixture.map((m) => {
            const sd = sdOf(m.variance);
            return { delta: m.delta, sd, logWeight: Math.log(m.weight), spike: logNormal(m.delta, sd) };
        })
    );
    let best = { logLikelihood: -Infinity, prior: DEFAULT_PRIOR };
    for (let scale = 0.002; scale < 0.5; scale *= 1.1) {
        // The slab's mass does not depend on the unchanged share, so it is computed once per scale.
        const slabs = parts.map((bench) =>
            bench.map((p) => {
                const slab = slabLogMass(p.delta, p.sd, scale);
                return slab.base + Math.log(slab.faster + slab.slower + slab.same);
            })
        );
        for (let unchanged = 0.3; unchanged < 0.996; unchanged += 0.005) {
            const logUnchanged = Math.log(unchanged);
            const logChanged = Math.log(1 - unchanged);
            let logLikelihood = 0;
            for (let i = 0; i < parts.length; i++) {
                const bench = parts[i];
                const terms = [];
                for (let j = 0; j < bench.length; j++) {
                    const spike = logUnchanged + bench[j].spike;
                    const changed = logChanged + slabs[i][j];
                    const top = Math.max(spike, changed);
                    terms.push(bench[j].logWeight + top + Math.log(Math.exp(spike - top) + Math.exp(changed - top)));
                }
                logLikelihood += logSumExp(terms);
            }
            if (logLikelihood > best.logLikelihood) {
                best = { logLikelihood, prior: { unchanged, scale } };
            }
        }
    }
    return { ...best.prior, fitted: true };
}

const prior = fitPrior(comparisons.map((c) => c.mixture));

/** The likeliest of `faster` / `slower` / `same` for a mixture of estimates of ln(base / test), and its probability. */
function resultOf(mixture) {
    const parts = [];
    let top = -Infinity;
    for (const m of mixture) {
        const part = { logWeight: Math.log(m.weight), ...logLikelihoods(m.delta, sdOf(m.variance), prior) };
        parts.push(part);
        top = Math.max(top, part.logWeight + Math.max(part.spike, part.changed));
    }
    let unchanged = 0;
    let faster = 0;
    let slower = 0;
    let same = 0;
    for (const p of parts) {
        unchanged += Math.exp(p.logWeight + p.spike - top);
        const changedWeight = Math.exp(p.logWeight + p.changed - top);
        faster += changedWeight * p.slab.faster;
        slower += changedWeight * p.slab.slower;
        same += changedWeight * p.slab.same;
    }
    const total = unchanged + faster + slower + same;
    faster /= total;
    slower /= total;
    same = 1 - faster - slower;
    if (faster > same && faster > slower) {
        return { result: 'faster', confidence: faster, slower };
    }
    if (slower > same) {
        return { result: 'slower', confidence: slower, slower };
    }
    return { result: 'same', confidence: same, slower };
}

let completedRounds = 0;
for (const c of comparisons) {
    completedRounds = Math.max(completedRounds, c.rounds[c.rounds.length - 1].round);
}
const maxRounds = testMeta.maxRounds ?? 1;

// A reported slowdown sends someone looking for its cause, so a lean takes every round left, up to SLOWER_EXTRA_ROUNDS
// past --runs, until SLOWER_SETTLED sure, rather than being shrunk away by the prior unexamined.
const SLOWER_LEAN = 0.1;
const SLOWER_Z = 1.5;
const SLOWER_SETTLED = 0.99;

for (const c of comparisons) {
    Object.assign(c, resultOf(c.mixture));
    // The measurement's own 95% range, shown with a `same`.
    c.rangePct = pctOf(Z_975 * sdOf(c.all.variance));
    // A change must hold in a second process pair (a round-1 change can be one process's luck); a doubtful
    // result reruns only while the rounds left could settle it or change it: noise they cannot beat is reported.
    const z = c.all.delta / sdOf(c.all.variance);
    c.leansSlower = c.slower >= SLOWER_LEAN || (c.all.delta <= -FLOOR_LOG && z <= -SLOWER_Z);
    const leansSlower = c.leansSlower && maxRounds > 1;
    const settledAt = leansSlower ? SLOWER_SETTLED : SETTLED;
    const remainingRounds = Math.max(0, maxRounds + (leansSlower ? SLOWER_EXTRA_ROUNDS : 0) - completedRounds);
    let reachable = false;
    if (remainingRounds > 0 && c.confidence < settledAt) {
        // Later rounds projected as ordinary ones agreeing with this estimate.
        let perRound = 0;
        for (const e of c.rounds) {
            perRound += nullScale * (e.within + noise.tau2);
        }
        perRound /= c.rounds.length;
        const variance = 1 / (1 / c.core.variance + remainingRounds / perRound);
        const best = resultOf([{ weight: 1, delta: c.all.delta, variance }]);
        reachable = leansSlower || best.confidence >= settledAt || best.result !== c.result;
    }
    c.settled = !(reachable || (c.result !== 'same' && c.rounds.length === 1 && remainingRounds > 0));
    const first = c.firstMixture ? resultOf(c.firstMixture) : null;
    c.flagged = first !== null && first.result !== 'same' && first.confidence >= SETTLED;
    c.upheld = c.flagged && c.result === first.result && c.confidence >= SETTLED;
    c.delta = round(pctOf(c.all.delta), 2);
    c.meanDelta = round(pctOf(c.all.meanDelta), 2);
    c.roundsLabel = c.rounds.map((e) => e.round).join('+');
    let baseLog = 0;
    for (const e of c.rounds) {
        baseLog += Math.log(e.baseMs);
    }
    c.baseMs = Math.exp(baseLog / c.rounds.length);
    // From the same estimate as the ratio, so the two never disagree.
    c.testMs = c.baseMs / Math.exp(c.all.delta);
}

// Running record of round-1 flags and whether a fresh process pair upheld them.
const recordPath = join(outputDir, RECORD_FILE);
const record = readJsonOrNull(recordPath) ?? { cohorts: {} };
const confirmableNow = comparisons.filter((c) => c.flagged && c.rounds.length > 1);
// Only a run with something to confirm, so runs that had none do not push real ones out of the cap.
if (confirmableNow.length) {
    record.cohorts[cohortKey] = {
        at: new Date().toISOString(),
        confirmed: confirmableNow.map((c) => c.key),
        upheld: confirmableNow.filter((c) => c.upheld).map((c) => c.key),
    };
    record.cohorts = newestCohorts(record.cohorts);
    writeFileSync(recordPath, JSON.stringify(record, null, 2));
}
let recordConfirmed = 0;
let recordUpheld = 0;
for (const cohort of Object.values(record.cohorts)) {
    recordConfirmed += cohort.confirmed.length;
    recordUpheld += cohort.upheld.length;
}

if (invalidComparisons.length > 0) {
    console.log(`Note: ${invalidComparisons.length} benchmark(s) skipped: no round measured on both sides:`);
    for (const c of invalidComparisons) {
        console.log(`  - ${c.name}`);
    }
}

// Biggest speed-up first, slow-downs last; ties on name for determinism.
comparisons.sort((a, b) => b.delta - a.delta || a.name.localeCompare(b.name));

const resultCounts = { faster: 0, slower: 0, same: 0 };
for (const c of comparisons) {
    resultCounts[c.result]++;
}
// Only changes this likely are listed as changes; a less sure one stays in its file's table with its confidence.
const REPORTED = 0.9;
const changes = comparisons.filter((c) => c.result !== 'same' && c.confidence >= REPORTED);
const unsureChanges = comparisons.filter((c) => c.result !== 'same' && c.confidence < REPORTED).length;
const reportedFaster = changes.filter((c) => c.result === 'faster').length;
const reportedSlower = changes.length - reportedFaster;
const roundSizes = [];
for (const c of comparisons) {
    for (const e of c.rounds) {
        roundSizes[e.round - 1] = (roundSizes[e.round - 1] ?? 0) + 1;
    }
}

// ── Output ──

const jsonPath = join(outputDir, `bench-compare-result${partialSuffix}.json`);
const mdPath = join(outputDir, `bench-compare-result${partialSuffix}.md`);
const confidencePct = (c) => Math.min(99, Math.round(c.confidence * 100));

writeFileSync(
    jsonPath,
    JSON.stringify(
        {
            baseRuns: baseRuns.length,
            testRuns: testRuns.length,
            roundSizes,
            paired,
            sessionShiftPct: round(pctOf(sessionShift), 2),
            floorPct: FLOOR_PCT,
            prior: { unchangedPct: round(prior.unchanged * 100, 1), scalePct: round(pctOf(prior.scale), 2) },
            results: resultCounts,
            selfCheck: { outside: selfOutside, total: selfZ.length, factor: round(selfFactor, 3) },
            nullFactor: round(nullFactor, 3),
            noise: {
                typicalPct: round(noise.tau * 100, 2),
                outlierSharePct: round(noise.outlierShare * 100, 1),
                outlierPct: round(noise.outlierTau * 100, 2),
                fromHistory: fittedNoise.fitted,
            },
            record: { confirmed: recordConfirmed, upheld: recordUpheld },
            benchmarks: comparisons.map((c) => ({
                key: c.key,
                name: c.name,
                group: c.group,
                file: c.file,
                result: c.result,
                confidence: round(c.confidence, 4),
                rangePct: round(c.rangePct, 2),
                settled: c.settled,
                flagged: c.flagged,
                rounds: c.roundsLabel,
                baseMs: round(c.baseMs, 5),
                testMs: round(c.testMs, 5),
                delta: c.delta,
                meanDelta: c.meanDelta,
                sdPct: round(Math.sqrt(c.all.variance) * 100, 2),
                withinPct: round(Math.sqrt(c.rounds.reduce((sum, e) => sum + e.within, 0) / c.rounds.length) * 100, 2),
                baseCalls: c.baseCalls,
                testCalls: c.testCalls,
            })),
            baseOnly: baseOnly.map((k) => baseSide.get(k).name),
            testOnly: testOnly.map((k) => testSide.get(k).name),
            invalid: invalidComparisons,
        },
        null,
        2
    )
);

// ── Markdown ──

/** Milliseconds per call to three significant figures. */
function fmtMs(ms) {
    if (ms >= 100) {
        return ms.toFixed(0);
    }
    if (ms >= 10) {
        return ms.toFixed(1);
    }
    if (ms >= 1) {
        return ms.toFixed(2);
    }
    return ms.toPrecision(3);
}

/**
 * Report-friendly file label. Drops the default benchmark-folder prefix for files that live
 * there (so `foo.bench.ts` / `tree-data/flatten.bench.ts` show without the long `testing/...`
 * path); the `.bench.ts` extension stays so the column names the file to edit.
 */
const BENCH_DIR_PREFIX = 'testing/behavioural/src/benchmarks/';
function shortFile(file) {
    return file.startsWith(BENCH_DIR_PREFIX) ? file.slice(BENCH_DIR_PREFIX.length) : file;
}

/** A markdown table padded as prettier pads one, so formatting the report changes nothing. */
function mdTable(head, rows, rightAligned) {
    const widths = head.map((title, i) => {
        let width = Math.max(3, title.length);
        for (const row of rows) {
            width = Math.max(width, row[i].length);
        }
        return width;
    });
    const line = (cells) =>
        `| ${cells.map((cell, i) => (rightAligned[i] ? cell.padStart(widths[i]) : cell.padEnd(widths[i]))).join(' | ')} |`;
    const rule = `| ${widths.map((w, i) => (rightAligned[i] ? `${'-'.repeat(w - 1)}:` : '-'.repeat(w))).join(' | ')} |`;
    return `${[line(head), rule, ...rows.map(line)].join('\n')}\n\n`;
}

const RESULT_MARK = { faster: '↑', slower: '↓', same: '~' };
/** Test's speed relative to base behind its mark, and for `same` the resolution: "↑ 1.42×", "~ 1.01× ±3%". */
const fmtResult = (c) =>
    `${RESULT_MARK[c.result]} ${Math.exp(c.all.delta).toFixed(2)}×${c.result === 'same' ? ` ±${Math.round(c.rangePct)}%` : ''}`;

const partialFilter = baseMeta.partial || testMeta.partial ? baseMeta.filter || testMeta.filter : '';
let md = partialFilter ? `# Benchmark Comparison (partial)\n\n` : `# Benchmark Comparison\n\n`;
if (partialFilter) {
    md += `> ⚠️ **Partial run** — filtered to \`${partialFilter}\`. This is not a complete comparison.\n\n`;
}
const totalDurationMs = (baseMeta.durationMs ?? 0) + (testMeta.durationMs ?? 0);

const reportEnv = baseMeta.env ?? testMeta.env ?? {};
// The noise model as both the report and the console state it.
const noiseLabel = {
    tau: (noise.tau * 100).toFixed(1),
    share: (noise.outlierShare * 100).toFixed(0),
    outlier: (noise.outlierTau * 100).toFixed(0),
};
const sideLine = (label, meta) => {
    const g = meta.git;
    const where = g?.branch ? `\`${g.branch}\`${g.commit ? ` @ ${g.commit}` : ''}` : '(unknown branch)';
    const dir = meta.targetDir ? ` · \`${basename(meta.targetDir)}\`` : '';
    return `- **${label}** — ${where}${dir}`;
};
const roundsLine = roundSizes.map((n, i) => `round ${i + 1}: ${n}`).join(', ');
// Each run's wall time, which includes judging the runs before it.
const roundWallMs = baseMeta.roundWallMs ?? [];
const roundsTimed = roundSizes
    .map((n, i) => `run ${i + 1} ${roundWallMs[i] ? `${fmtDuration(roundWallMs[i])} ` : ''}(${n} benches)`)
    .join(', ');
md += `${sideLine('base', baseMeta)}\n`;
md += `${sideLine('test', testMeta)}\n`;
md += `- **Machine** — Chromium ${reportEnv.chromium ?? '?'}`;
if (reportEnv.cpu) {
    md += ` · ${reportEnv.cpu}${reportEnv.cpuCount ? ` × ${reportEnv.cpuCount}` : ''}`;
}
md += `\n`;
const wall = fmtDuration(paired ? (baseMeta.wallMs ?? 0) : totalDurationMs);
md += `- **Wall time** — ${wall}: ${roundsTimed}\n`;
if (shiftTaken) {
    md += `- **Separate sessions** — base and test did not run paired, so the median bench's shift `;
    md += `(test ${Math.abs(pctOf(sessionShift)).toFixed(1)}% ${sessionShift >= 0 ? 'faster' : 'slower'}) is taken out `;
    md += `of every result: a change that moves every bench alike shows only here\n`;
} else if (!paired) {
    md += `- **Separate sessions** — base and test did not run paired, and under ${MIN_POOL} benches are too few to `;
    md += `measure the shift between sessions, so none was taken out\n`;
}
md += `- **Results** — ${reportedFaster} faster, ${reportedSlower} slower, ${resultCounts.same} same`;
md += unsureChanges
    ? `; ${unsureChanges} likelier changed than not but under ${REPORTED * 100}% sure, left in the tables\n`
    : `\n`;
md += `- **Result** — test's speed relative to base: ↑ faster, ↓ slower, ~ same (a change under ${FLOOR_PCT}%, `;
md += `± the measurement's 95% range)\n`;
md += `- **Confidence** — how likely the result is right, given that ${Math.round(prior.unchanged * 100)}% of benches `;
md += `${prior.fitted ? 'in this run' : 'in a typical run'} did not change and a real `;
md += `change is typically ${pctOf(prior.scale).toFixed(1)}%; from every round's calls, between-process noise `;
md += `(±${noiseLabel.tau}%, and ±${noiseLabel.outlier}% for the ${noiseLabel.share}% of process pairs that land far off; `;
md += `${fittedNoise.fitted ? 'learned on this machine' : 'default'}) and the run's own spread across benches`;
md += selfFactor > 1 ? `; within-run noise widened ×${selfFactor.toFixed(2)} by the A/A self-check\n` : `\n`;
if (recordConfirmed) {
    md += `- **Round-1 changes upheld** — ${recordUpheld} of ${recordConfirmed} in ${Object.keys(record.cohorts).length} recorded runs\n`;
}
// Later of the two sides — the run as a whole finished when the slower side did. ISO strings sort lexically.
const runTimes = [testMeta.lastRunAt ?? testMeta.timestamp, baseMeta.lastRunAt ?? baseMeta.timestamp].filter(Boolean);
const ranAtIso = runTimes.length ? runTimes.reduce((a, b) => (a > b ? a : b)) : '';
const ranAt = ranAtIso
    ? new Date(ranAtIso).toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }).replace(',', '')
    : '';
md += ranAt ? `- **When** — ${ranAt} (UK)\n\n` : `\n`;

const RESULT_HEAD = ['Result', 'Confidence', 'ms per call, base → test', 'Runs'];
const RESULT_RIGHT = [false, true, true, true];
const resultCells = (c) => [
    fmtResult(c),
    `${confidencePct(c)}%`,
    `${fmtMs(c.baseMs)} → ${fmtMs(c.testMs)}`,
    String(c.rounds.length),
];

const changeTable = (list) =>
    mdTable(
        ['Benchmark', ...RESULT_HEAD, 'File'],
        list.map((c) => [c.name, ...resultCells(c), shortFile(c.file)]),
        [false, ...RESULT_RIGHT, false]
    );

md += `## Changes\n\n`;
if (changes.length) {
    md += changeTable(changes);
} else {
    md += `No benchmark changed with at least ${REPORTED * 100}% confidence.\n\n`;
}

// Measured slower but not confirmed: kept in view, as a lean that repeats across runs is worth a targeted rerun.
const slowerUnconfirmed = comparisons.filter((c) => c.leansSlower && !changes.includes(c));
if (slowerUnconfirmed.length) {
    md += `## Slower, not confirmed\n\n`;
    md += `At least ${SLOWER_LEAN * 100}% likely slower, or measured at least ${FLOOR_PCT}% and ${SLOWER_Z}× its noise `;
    md += `slower, without reaching ${REPORTED * 100}%; one that recurs across runs is worth a \`--filter\`ed run of `;
    md += `its file with more rounds.\n\n`;
    md += changeTable(slowerUnconfirmed);
}

// Key by file + group so two bench files with identically-named suites don't get merged into one section.
const byFileGroup = new Map();
for (const c of comparisons) {
    const key = `${c.file} :: ${c.group}`;
    if (!byFileGroup.has(key)) {
        byFileGroup.set(key, { file: c.file, group: c.group, items: [] });
    }
    byFileGroup.get(key).items.push(c);
}

if (byFileGroup.size > 0) {
    md += `## All benchmarks\n\n`;
    for (const { file, group, items } of byFileGroup.values()) {
        const shortGroup = group.includes(' > ') ? group.split(' > ').pop() : group;
        md += `### ${shortFile(file)} › ${shortGroup}\n\n`;
        md += mdTable(
            ['Benchmark', ...RESULT_HEAD],
            items.map((c) => [c.name, ...resultCells(c)]),
            [false, ...RESULT_RIGHT]
        );
    }
}

if (baseOnly.length > 0 || testOnly.length > 0) {
    md += `## Unmatched Benchmarks\n\n`;
    if (baseOnly.length > 0) {
        md += `**Only in base** (removed or renamed?):\n`;
        for (const k of baseOnly) {
            const b = baseSide.get(k);
            md += `- [${shortFile(b.file)}] ${b.name}\n`;
        }
        md += `\n`;
    }
    if (testOnly.length > 0) {
        md += `**Only in test** (added or renamed?):\n`;
        for (const k of testOnly) {
            const t = testSide.get(k);
            md += `- [${shortFile(t.file)}] ${t.name}\n`;
        }
        md += `\n`;
    }
}

if (invalidComparisons.length > 0) {
    md += `## Skipped (not measured on both sides)\n\n`;
    md += `No round measured these benchmarks on both sides (an errored bench, or a feature one checkout lacks).\n\n`;
    for (const c of invalidComparisons) {
        md += `- [${shortFile(c.file)}] ${c.name}\n`;
    }
    md += `\n`;
}

md += `---\n\n`;
const generatedAt = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false }).replace(',', '');
md += `_Generated by bench-compare.mjs — ${generatedAt} (UK)_\n`;

writeFileSync(mdPath, md);

// ── Console summary ──

console.log('Results written to:');
console.log(`  ${jsonPath}`);
console.log(`  ${mdPath}`);
console.log(
    `\n=== Summary (benches per round: ${roundsLine}) — ${reportedFaster} faster, ${reportedSlower} slower, ` +
        `${resultCounts.same} same${unsureChanges ? `, ${unsureChanges} under ${REPORTED * 100}% sure` : ''} ===`
);
console.log(
    `  self-check ${selfOutside}/${selfZ.length} outside${selfFactor > 1 ? ` (widened ×${selfFactor.toFixed(2)})` : ''}` +
        ` · τ ±${noiseLabel.tau}%, ${noiseLabel.share}% outliers ±${noiseLabel.outlier}%` +
        ` (${fittedNoise.fitted ? 'history' : 'default'})` +
        ` · empirical null ×${nullFactor.toFixed(2)}` +
        (shiftTaken ? ` · separate sessions, shift ${pctOf(sessionShift).toFixed(1)}% taken out` : '') +
        (!paired && !shiftTaken ? ' · separate sessions, too few benches to take a shift out' : '')
);
for (const c of changes) {
    console.log(
        `  ${fmtResult(c).padEnd(14)} ${String(confidencePct(c)).padStart(2)}%  [${shortFile(c.file)}] ${c.name}`
    );
}
