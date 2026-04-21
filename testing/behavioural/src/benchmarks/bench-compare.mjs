#!/usr/bin/env node
/**
 * bench-compare.mjs — Compare benchmark performance between two project directories.
 *
 * Setup:
 *   Clone two sibling checkouts of the monorepo next to each other:
 *     <parent>/ag-grid    — the "test" working copy (your branch with changes)
 *     <parent>/ag-grid2   — the "base" reference copy (typically `latest`)
 *   where <parent> is the folder containing this monorepo root.
 *   Run `yarn install` in both before the first benchmark.
 *
 * Usage:
 *   node bench-compare.mjs base [dir] [options]    Run benchmarks for the base project
 *   node bench-compare.mjs test [dir] [options]    Run benchmarks for the test project
 *   node bench-compare.mjs compare [options]       Compare saved results and generate report
 *
 * Defaults:
 *   base dir: <parent>/ag-grid2
 *   test dir: <parent>/ag-grid
 *   results:  ./tmp/   (relative to this script)
 *
 * Options:
 *   --runs <n>        Number of runs (default: 2)
 *   --filter <glob>   Filter benchmark files (forwarded to vitest bench)
 *   --output <path>   Output directory for results (default: ./tmp)
 *   --reuse           Skip runs where output file already exists
 *
 * Files written to the output directory:
 *   base-run-<n>.json         Raw vitest bench output for base run <n> (one file per run,
 *                             consumed later by `compare`). Kept between runs — use --reuse to
 *                             skip re-running if the file exists.
 *   test-run-<n>.json         Same, for the test side.
 *   bench-compare-result.json Machine-readable comparison: per-benchmark ops/sec, rme, delta
 *                             with confidence interval, and unmatched benchmarks.
 *   bench-compare-result.md   Human-readable report with a Notable Changes table, detailed
 *                             per-group tables, and a list of unmatched benchmarks.
 *
 * Examples:
 *   node bench-compare.mjs base                    # Run base benchmarks in <parent>/ag-grid2
 *   node bench-compare.mjs test                    # Run test benchmarks in <parent>/ag-grid
 *   node bench-compare.mjs base ~/other-grid       # Run base benchmarks in custom dir
 *   node bench-compare.mjs compare                 # Generate comparison report
 *   node bench-compare.mjs test --runs 5 --filter "getvalue"
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

Options:
  --runs <n>        Number of runs (default: 2)
  --filter <glob>   Filter benchmark files
  --output <path>   Results directory (default: ./tmp)
  --reuse           Skip runs where output file exists

Files written to the output directory:
  base-run-<n>.json            Raw vitest output for base run <n> (one per run).
  test-run-<n>.json            Raw vitest output for test run <n> (one per run).
  bench-compare-result.json    Structured comparison (all benchmarks, both sides, deltas).
  bench-compare-result.md      Human-readable report (notable changes + detailed tables).`);
    process.exit(command ? 0 : 1);
}

if (!['base', 'test', 'compare'].includes(command)) {
    console.error(`Unknown command: ${command}. Use 'base', 'test', or 'compare'.`);
    process.exit(1);
}

let runs = 2;
let filter = '';
let outputDir = join(__dirname, 'tmp');
let reuse = false;
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
        case '--filter':
            filter = takeValue('--filter', args, i++);
            break;
        case '--output':
            outputDir = resolve(takeValue('--output', args, i++));
            break;
        case '--reuse':
            reuse = true;
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

// Benchmarks to exclude — these depend on jsdom/DOM rendering and produce
// unreliable results that vary between environments.
const EXCLUDED_BENCH_FILES = ['modules.bench'];

// Resolve target directory defaults — sibling checkouts next to the monorepo root.
if (!targetDir && (command === 'base' || command === 'test')) {
    targetDir = command === 'base' ? resolve(SIBLING_PARENT, 'ag-grid2') : resolve(SIBLING_PARENT, 'ag-grid');
}

mkdirSync(outputDir, { recursive: true });

// ── Benchmark runner ──

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function runBenchmarks(projectDir, outputFile) {
    const behaviouralDir = join(projectDir, 'testing', 'behavioural');
    if (!existsSync(behaviouralDir)) {
        console.error(`Error: ${behaviouralDir} does not exist.`);
        return false;
    }

    const benchArgs = ['--node-options=--expose-gc', 'vitest', 'bench', '--outputJson', outputFile];
    for (const ex of EXCLUDED_BENCH_FILES) {
        benchArgs.push('--exclude', `**/${ex}*`);
    }
    if (filter) {
        benchArgs.push(filter);
    }

    console.log(`  Dir: ${projectDir}`);
    console.log(`  Running: npx ${benchArgs.join(' ')}\n`);

    const result = spawnSync('npx', benchArgs, {
        cwd: behaviouralDir,
        stdio: 'inherit',
        env: { ...process.env, NX_DAEMON: 'false', BENCH_COMPARE: '1' },
    });

    if (result.status !== 0) {
        console.error(`\n  Benchmark failed (exit ${result.status})`);
        return false;
    }
    return true;
}

// ── Run phase (base or test) ──

if (command === 'base' || command === 'test') {
    const label = command;
    console.log(`=== Running ${label} benchmarks ===`);
    console.log(`Directory:  ${targetDir}`);
    console.log(`Runs:       ${runs}`);
    console.log(`Output:     ${outputDir}`);
    if (filter) {
        console.log(`Filter:     ${filter}`);
    }
    console.log('');

    // Track the exact run filenames that belong to this cohort. Compare will only load these
    // files — any higher-index stale files from a previous invocation with more runs are ignored.
    const cohortFiles = [];
    for (let i = 1; i <= runs; i++) {
        const fileName = `${label}-run-${i}.json`;
        const outFile = join(outputDir, fileName);
        cohortFiles.push(fileName);

        if (reuse && existsSync(outFile)) {
            console.log(`  Reusing ${label} run ${i}/${runs}`);
            continue;
        }

        if (i > 1) {
            console.log('--- Cooldown (3s) ---');
            await sleep(3000);
        }

        console.log(`--- ${label} run ${i}/${runs} ---`);
        if (!runBenchmarks(targetDir, outFile)) {
            console.error(`${label} benchmark failed at run ${i}, aborting.`);
            process.exit(1);
        }
        console.log('');
    }

    // Write a sidecar metadata file describing this invocation. The `compare` phase reads
    // both sides' metadata to (a) refuse to compare if they were produced with incompatible
    // settings (different filter, different exclude list), and (b) load only the exact run
    // files listed in `runFiles`, ignoring any stale higher-index files from previous runs
    // with a larger --runs value.
    const metaPath = join(outputDir, `${label}-meta.json`);
    writeFileSync(
        metaPath,
        JSON.stringify(
            {
                label,
                filter,
                excludedFiles: EXCLUDED_BENCH_FILES,
                runsRequested: runs,
                runFiles: cohortFiles,
                targetDir,
                timestamp: new Date().toISOString(),
            },
            null,
            2
        )
    );

    console.log(`\n=== ${label} benchmarks complete (${runs} runs saved to ${outputDir}) ===`);
    process.exit(0);
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
        results.push(parsed);
    }
    return results;
}

function isExcluded(filepath) {
    return EXCLUDED_BENCH_FILES.some((ex) => filepath.includes(ex));
}

/**
 * Extract a file-unique identifier from a filepath. Uses the path relative to the first
 * `src/` segment so keys are stable across base/test checkouts that live in different
 * absolute directories. Falls back to the basename when `src/` is absent.
 */
function fileIdentity(filepath) {
    const srcIndex = filepath.lastIndexOf('/src/');
    if (srcIndex !== -1) {
        return filepath.slice(srcIndex + 1); // keep the leading 'src/...'
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
                });
            }
        }
    }
    return map;
}

/** Median of a numeric array. Assumes non-empty. */
function median(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
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
 * - Point estimate: median hz across runs (robust to outliers).
 * - Uncertainty: max of (a) run-to-run relative std dev of hz, and (b) mean of within-run rme.
 *   Taking the max avoids hiding run-to-run variance when within-run rme looks tight,
 *   and avoids hiding within-run jitter when only one run was captured.
 */
function aggregateRuns(allRuns) {
    // Collect per-benchmark samples across runs
    const samplesByKey = new Map();

    for (const runData of allRuns) {
        const benchmarks = extractBenchmarks(runData);
        for (const [key, data] of benchmarks) {
            let bucket = samplesByKey.get(key);
            if (!bucket) {
                bucket = { name: data.name, group: data.group, file: data.file, hz: [], rme: [], sampleCount: 0 };
                samplesByKey.set(key, bucket);
            }
            bucket.hz.push(data.hz);
            bucket.rme.push(data.rme);
            bucket.sampleCount += data.sampleCount;
        }
    }

    const result = new Map();
    for (const [key, bucket] of samplesByKey) {
        const n = bucket.hz.length;
        const medianHz = median(bucket.hz);
        const meanHz = bucket.hz.reduce((a, b) => a + b, 0) / n;
        const std = sampleStdDev(bucket.hz, meanHz);
        // Relative std dev as a percentage — the run-to-run noise signal.
        const runRme = meanHz > 0 ? (std / meanHz) * 100 : 0;
        // Average within-run rme reported by vitest — the per-run noise floor.
        const meanWithinRme = bucket.rme.reduce((a, b) => a + b, 0) / n;
        const rme = Math.max(runRme, meanWithinRme);

        result.set(key, {
            name: bucket.name,
            group: bucket.group,
            file: bucket.file,
            hz: medianHz,
            rme,
            sampleCount: bucket.sampleCount,
            runCount: n,
        });
    }
    return result;
}

/** Read the sidecar metadata file for a side. Returns null if missing (e.g. legacy runs). */
function loadMeta(label) {
    const path = join(outputDir, `${label}-meta.json`);
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

// Refuse to compare if the two sides were produced with incompatible settings — otherwise we'd
// silently merge e.g. a filtered base run with an unfiltered test run, skewing the deltas.
if (baseMeta.filter !== testMeta.filter) {
    console.error(
        `Error: base and test were produced with different --filter values ` +
            `(base: ${JSON.stringify(baseMeta.filter)}, test: ${JSON.stringify(testMeta.filter)}). ` +
            `Re-run both sides with the same filter.`
    );
    process.exit(1);
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
        baseHz: round(base.hz, 4),
        baseRme: round(base.rme, 2),
        baseSamples: base.sampleCount,
        testHz: round(test.hz, 4),
        testRme: round(test.rme, 2),
        testSamples: test.sampleCount,
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

// Sort by conservative delta magnitude
comparisons.sort((a, b) => {
    const ac = Math.abs(a.deltaConservative);
    const bc = Math.abs(b.deltaConservative);
    if (ac !== bc) {
        return bc - ac;
    }
    return Math.abs(b.delta) - Math.abs(a.delta);
});

// ── Output ──

const jsonPath = join(outputDir, 'bench-compare-result.json');
const mdPath = join(outputDir, 'bench-compare-result.md');

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

let md = `# Benchmark Comparison\n\n`;
const baseRunCount = baseRuns.length;
const testRunCount = testRuns.length;
const runCountLabel =
    baseRunCount === testRunCount
        ? `${baseRunCount} run(s) per side`
        : `${baseRunCount} base run(s), ${testRunCount} test run(s)`;
md += `${runCountLabel}. Aggregation: median hz per benchmark; `;
md += `rme = max(run-to-run std, mean within-run rme).\n\n`;

const notable = comparisons
    .filter((c) => Math.abs(c.delta) > 3)
    .slice()
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
if (notable.length > 0) {
    md += `## Notable Changes\n\n`;
    md += `| Benchmark | base (ops/s) | test (ops/s) | Result |\n`;
    md += `|-----------|-------------|-------------|--------|\n`;
    for (const c of notable) {
        const result = fmtSpeedup(c);
        const cell = isNoisy(c) ? `${result} <sub>noisy</sub>` : `**${result}**`;
        md += `| ${c.name} | ${fmtHz(c.baseHz)} | ${fmtHz(c.testHz)} | ${cell} |\n`;
    }
    md += `\n`;
} else {
    md += `## No notable changes detected.\n\n`;
}

const byGroup = new Map();
for (const c of comparisons) {
    if (!byGroup.has(c.group)) {
        byGroup.set(c.group, []);
    }
    byGroup.get(c.group).push(c);
}

md += `## Detailed Results\n\n`;
md += `rme = relative margin of error (lower = more precise).\n\n`;

for (const [group, items] of byGroup) {
    const shortGroup = group.includes(' > ') ? group.split(' > ').pop() : group;
    md += `### ${shortGroup}\n\n`;
    md += `| Benchmark | base ops/s (rme) | test ops/s (rme) | Result |\n`;
    md += `|-----------|-----------------|-----------------|--------|\n`;
    for (const c of items) {
        const result = fmtSpeedup(c);
        const cell = isNoisy(c) ? `${result} <sub>noisy</sub>` : `**${result}**`;
        md += `| ${c.name} | ${fmtHz(c.baseHz)} (±${c.baseRme.toFixed(1)}%) | ${fmtHz(c.testHz)} (±${c.testRme.toFixed(1)}%) | ${cell} |\n`;
    }
    md += `\n`;
}

if (baseOnly.length > 0 || testOnly.length > 0) {
    md += `## Unmatched Benchmarks\n\n`;
    if (baseOnly.length > 0) {
        md += `**Only in base** (removed or renamed?):\n`;
        for (const k of baseOnly) {
            md += `- ${baseAgg.get(k).name}\n`;
        }
        md += `\n`;
    }
    if (testOnly.length > 0) {
        md += `**Only in test** (added or renamed?):\n`;
        for (const k of testOnly) {
            md += `- ${testAgg.get(k).name}\n`;
        }
        md += `\n`;
    }
}

if (invalidComparisons.length > 0) {
    md += `## Skipped (invalid hz)\n\n`;
    md += `These benchmarks were excluded from the comparison because the base or test had a `;
    md += `non-positive or non-finite hz value.\n\n`;
    for (const c of invalidComparisons) {
        md += `- ${c.name}: ${c.reason} (base=${c.baseHz}, test=${c.testHz})\n`;
    }
    md += `\n`;
}

md += `---\n\n`;
md += `*Generated by bench-compare.mjs — ${runCountLabel}, median hz, ${new Date().toISOString().slice(0, 19).replace('T', ' ')}*\n`;

writeFileSync(mdPath, md);

// ── Console summary ──

console.log('Results written to:');
console.log(`  ${jsonPath}`);
console.log(`  ${mdPath}`);
console.log(`\n=== Summary (${runCountLabel}, median hz) ===`);

if (notable.length > 0) {
    for (const c of notable) {
        const arrow = c.delta > 0 ? '↑' : '↓';
        const result = fmtSpeedup(c);
        const suffix = isNoisy(c) ? '  (noisy)' : '';
        console.log(
            `  ${arrow} ${result.padStart(16)}  ${c.name}  (${fmtHz(c.baseHz)} → ${fmtHz(c.testHz)} ops/s)${suffix}`
        );
    }
    const notableNoisy = notable.filter(isNoisy).length;
    if (notableNoisy > 0) {
        console.log(`  ${notableNoisy} of ${notable.length} notable change(s) are within noise.`);
    }
} else {
    console.log('  No notable changes detected.');
}
