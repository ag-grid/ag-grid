/* eslint-disable no-console, @typescript-eslint/no-require-imports */
/**
 * Duration-balanced shard assignment for Playwright E2E tests.
 *
 * Playwright's built-in `--shard=n/m` balances by test *count*, but per-test cost varies wildly
 * across spec files, so count-balanced shards have very uneven wall-clock times. This script
 * instead partitions spec *files* across shards using historical per-file durations (committed
 * as a timings JSON file), so every shard gets a near-equal share of the total test time.
 *
 * Usage (assignment — run from the repo root in the CI init job):
 *   node assign-e2e-shards.js --max <maxShards> --count <testCount> \
 *     --timings <timings.json> --test-dir <playwright testDir>
 *
 * Prints a GitHub Actions matrix as JSON: {"include": [{"shard": 1, "args": "<playwright args>"}]}.
 * Each shard's `args` is either a list of spec files (relative to the Playwright package), or a
 * single spec file plus `--shard=j/k` when that file is too slow to fit in one shard and must be
 * split internally (Playwright then count-shards within the file, which is accurate enough since
 * tests within one file have similar cost).
 *
 * Every invocation computes the same global partition from the same inputs, so the union of all
 * shards covers every spec file exactly once.
 *
 * Fallback: if the timings file is missing, unparseable, or stale (covers too few of the spec
 * files on disk), the script emits the legacy count-based matrix ({"shard": i, "args":
 * "--shard=i/n"}) so CI degrades gracefully to Playwright's own sharding.
 *
 * Durations are specific to the CI event type they were captured from: a workflow may sweep a
 * wider framework matrix or capture more snapshot output on pushes than on pull requests, which
 * scales the cost of the affected spec files. Timings captured from one event type therefore
 * cannot plan shards for another — the mis-weighted files get packed together and the bins
 * overflow the job timeout. Keep one timings file per event type and pass the matching one.
 *
 * Usage (regenerating a timings file):
 *   1. Pick a run of the SAME event type as the file you are regenerating (a push run for the
 *      push timings, a pull_request run for the PR timings), then download its shard artifacts:
 *        for i in $(seq 1 48); do gh run download <run-id> -n test-results-e2e-shard-$i -D /tmp/e2e-timings/shard-$i; done
 *   2. Check every shard produced a `reports/` directory — `aggregate` skips artifacts without
 *      one, and a silently-skipped shard leaves its spec files to be guessed at median weight.
 *   3. Aggregate them into the file for that event type:
 *        node assign-e2e-shards.js aggregate /tmp/e2e-timings > <path>/shard-timings.json
 */
const fs = require('fs');
const path = require('path');

// Spec files ignored by the Playwright config (testIgnore) — excluded from assignment. Harmless
// if this drifts out of sync: Playwright still applies testIgnore to any files passed as args.
const IGNORED_SPECS = ['page-verification.spec.ts'];

// Minimum fraction of on-disk spec files that must appear in the timings file; below this the
// timings are considered stale and we fall back to count-based sharding.
const MIN_TIMINGS_COVERAGE = 0.75;

function parseArgs(argv) {
    const args = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith('--')) {
            args[argv[i].slice(2)] = argv[++i];
        } else {
            args._.push(argv[i]);
        }
    }
    return args;
}

/** Recursively find `*.spec.ts` files under `dir`, returned relative to `dir`. */
function findSpecFiles(dir, prefix = '') {
    const result = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
        const rel = prefix + entry.name;
        if (entry.isDirectory()) {
            result.push(...findSpecFiles(path.join(dir, entry.name), rel + '/'));
        } else if (entry.name.endsWith('.spec.ts') && !IGNORED_SPECS.includes(entry.name)) {
            result.push(rel);
        }
    }
    return result;
}

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted.length === 0 ? 1 : sorted[Math.floor(sorted.length / 2)];
}

/**
 * Test whether all files fit into at most `maxShards` shards of duration budget `budget`. Files
 * slower than the budget are split into equal chunks (run via Playwright's internal `--shard`);
 * the rest are bin-packed whole using first-fit-decreasing.
 *
 * Returns the shard list (each shard: { files, seconds, split? }) or null if infeasible.
 */
function packShards(weighted, maxShards, budget) {
    const shards = [];
    const packable = [];
    for (const { file, seconds } of weighted) {
        const chunks = Math.ceil(seconds / budget);
        if (chunks > 1) {
            for (let j = 1; j <= chunks; j++) {
                shards.push({ files: [file], seconds: seconds / chunks, split: { index: j, total: chunks } });
            }
        } else {
            packable.push({ file, seconds });
        }
    }

    // First-fit-decreasing: `weighted` is already sorted by descending duration.
    const bins = [];
    for (const { file, seconds } of packable) {
        const bin = bins.find((b) => b.seconds + seconds <= budget);
        if (bin) {
            bin.files.push(file);
            bin.seconds += seconds;
        } else {
            bins.push({ files: [file], seconds });
        }
    }

    const all = [...shards, ...bins];
    return all.length <= maxShards ? all : null;
}

/** Find (via binary search) the smallest per-shard duration budget that fits in `maxShards`. */
function planShards(weighted, maxShards) {
    const total = weighted.reduce((sum, w) => sum + w.seconds, 0);
    let lo = total / maxShards;
    let hi = total;
    for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        if (packShards(weighted, maxShards, mid)) {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    return packShards(weighted, maxShards, hi);
}

function assign(args) {
    const maxShards = Number(args.max);
    const testCount = Number(args.count ?? 0);
    const testDir = args['test-dir'];

    const fallback = (reason) => {
        console.error(`Falling back to count-based sharding: ${reason}`);
        // Mirrors calculate-shards.js: one shard per 100 tests, capped at maxShards.
        const shardCount = Math.min(Math.ceil(testCount / 100), maxShards);
        const include = [];
        for (let i = 1; i <= shardCount; i++) {
            include.push({ shard: i, args: `--shard=${i}/${shardCount}` });
        }
        console.log(JSON.stringify({ include }));
    };

    let timings;
    try {
        timings = JSON.parse(fs.readFileSync(args.timings, 'utf8'));
    } catch (e) {
        return fallback(`cannot read timings file ${args.timings} (${e.message})`);
    }

    const specFiles = findSpecFiles(testDir);
    if (specFiles.length === 0) {
        return fallback(`no spec files found in ${testDir}`);
    }

    const known = specFiles.filter((f) => typeof timings.files?.[f] === 'number');
    const coverage = known.length / specFiles.length;
    if (coverage < MIN_TIMINGS_COVERAGE) {
        return fallback(`timings are stale — only ${known.length}/${specFiles.length} spec files covered`);
    }

    // Unknown (new) spec files get the median duration of known files.
    const defaultSeconds = median(known.map((f) => timings.files[f]));
    const weighted = specFiles
        .map((file) => ({ file, seconds: timings.files[file] ?? defaultSeconds }))
        .sort((a, b) => b.seconds - a.seconds || (a.file < b.file ? -1 : 1));

    const shards = planShards(weighted, maxShards);
    shards.sort((a, b) => b.seconds - a.seconds);

    const include = shards.map((shard, i) => {
        const files = shard.files.map((f) => `${path.basename(testDir)}/${f}`).join(' ');
        const split = shard.split ? ` --shard=${shard.split.index}/${shard.split.total}` : '';
        console.error(`Shard ${i + 1}: ~${Math.round(shard.seconds)}s — ${files}${split}`);
        return { shard: i + 1, args: `${files}${split}` };
    });
    console.log(JSON.stringify({ include }));
}

/**
 * Aggregate per-spec-file durations from downloaded CI artifacts. Scans each artifact directory
 * under `dir` for `reports/ag-charts-website-e2e.json` (a Playwright JSON report) and sums
 * first-attempt test durations per top-level suite file.
 */
function aggregate(dir) {
    const byFile = {};
    for (const entry of fs.readdirSync(dir).sort()) {
        const reportPath = path.join(dir, entry, 'reports', 'ag-charts-website-e2e.json');
        if (!fs.existsSync(reportPath)) continue;
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        for (const suite of report.suites ?? []) {
            let seconds = 0;
            const walk = (s) => {
                for (const spec of s.specs ?? []) {
                    for (const test of spec.tests ?? []) {
                        seconds += (test.results?.[0]?.duration ?? 0) / 1000;
                    }
                }
                (s.suites ?? []).forEach(walk);
            };
            walk(suite);
            byFile[suite.file] = (byFile[suite.file] ?? 0) + seconds;
        }
    }
    const files = Object.fromEntries(
        Object.entries(byFile)
            .sort((a, b) => b[1] - a[1])
            .map(([file, seconds]) => [file, Math.round(seconds)])
    );
    console.log(
        JSON.stringify(
            {
                _readme:
                    'Historical per-spec-file E2E durations (seconds) used by ' +
                    'external/ag-shared/scripts/shard/assign-e2e-shards.js to balance CI shards. ' +
                    'Durations are specific to the CI event type they were captured from, so ' +
                    'regenerate this file from a run of the same event type it is used for. ' +
                    'To regenerate, see the usage notes at the top of that script.',
                files,
            },
            null,
            4
        )
    );
}

const args = parseArgs(process.argv.slice(2));
if (args._[0] === 'aggregate') {
    aggregate(args._[1]);
} else {
    assign(args);
}
