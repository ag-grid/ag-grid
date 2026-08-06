#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Compare the current jscpd duplication report against the committed baseline.
 *
 * The scan covers `SCAN_ROOT` only, and `gate.scope` narrows it further to shipped source.
 * Duplication elsewhere either ships to nobody (docs, tooling, tests) or is inherent: sibling
 * locale files duplicate their language variants by nature.
 *
 * Only clones with *both* files inside `gate.scope` can fail the check.
 *
 * Check mode never writes, because it runs inside `yarn nx lint` and `./checks.sh` — an
 * auto-tightened baseline would appear as a surprise edit in unrelated diffs.
 *
 * Usage: node scripts/ci/jscpd-baseline-check.mjs [--update]
 */

const REPORT_PATH = 'node_modules/.cache/jscpd/jscpd-report.json';
const BASELINE_PATH = '.jscpd-baseline.json';
const JSCPD_BIN = path.join('node_modules', '.bin', 'jscpd');
const CONFIG_PATH = '.jscpd.json';
/** The only tree handed to jscpd. Keep in step with DEFAULT_SCOPE: the gate cannot see what is not scanned. */
const SCAN_ROOT = 'packages';
/**
 * Only the grid cores count: that is where duplication translates into bundle bytes a user
 * downloads. `ag-stack` is in scope because it is bundled into those cores — a helper reinvented
 * in `ag-grid-community` that already exists in `ag-stack` is exactly what this should catch.
 * The framework wrappers are largely generated property and import lists, so their clones are not
 * something a developer can extract; `.jscpd.json` skips those packages outright, and this scope
 * is the durable backstop for anything that slips past those globs.
 */
const DEFAULT_SCOPE = [
    'packages/ag-grid-community/src/**',
    'packages/ag-grid-enterprise/src/**',
    'packages/ag-stack/src/**',
];
const MAX_LISTED_CLONES = 10;
const UPDATE_COMMAND = 'yarn nx lint:jscpd:baseline all';
/** `gate.scope` supports only `*` and `**`; brace and character-class syntax would match nothing. */
const UNSUPPORTED_GLOB_SYNTAX = /[{}?[\]]/;

/** Collapse whitespace and drop blank lines so fingerprints survive unrelated reformatting. */
export function normaliseFragment(fragment) {
    return String(fragment ?? '')
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter((line) => line.length > 0)
        .join('\n');
}

export function fingerprint(fragment) {
    return createHash('sha1').update(normaliseFragment(fragment)).digest('hex');
}

/** Minimal glob support: `**` crosses directory separators, `*` does not. */
function globToRegExp(glob) {
    const pattern = glob
        .split('**')
        .map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))
        .join('.*');
    return new RegExp(`^${pattern}$`);
}

function inScope(name, scopeMatchers) {
    const normalised = String(name ?? '').replace(/\\/g, '/');
    return scopeMatchers.some((matcher) => matcher.test(normalised));
}

/**
 * jscpd names files relative to the path it was given, so a scan of `packages` reports
 * `ag-grid-community/src/...`. Re-root them so `gate.scope` globs stay workspace-relative and
 * the printed labels are paths a developer can open.
 *
 * The reporter also resolves each clone's `fragment` against the working directory, which a
 * non-`.` scan root defeats — it emits an empty string. Re-read the fragment from the rebased
 * path, otherwise every fingerprint collapses to the hash of "" and the multiset check is blind.
 */
export function rebaseReportPaths(report, scanRoot, readLines = (name) => fs.readFileSync(name, 'utf8').split('\n')) {
    const rebase = (file) => {
        if (file?.name) {
            file.name = `${scanRoot}/${String(file.name).replace(/\\/g, '/')}`;
        }
    };
    for (const clone of report.duplicates ?? []) {
        rebase(clone.firstFile);
        rebase(clone.secondFile);
        const { name, startLoc, endLoc } = clone.firstFile ?? {};
        if (!clone.fragment && name && startLoc?.line && endLoc?.line) {
            clone.fragment = readLines(name)
                .slice(startLoc.line - 1, endLoc.line)
                .join('\n');
        }
    }
    return report;
}

/** The gated subset: clones with both files in scope, including intra-file clones. */
export function computeGate(report, scope) {
    const matchers = scope.map(globToRegExp);
    const gated = (report.duplicates ?? []).filter(
        (clone) => inScope(clone.firstFile?.name, matchers) && inScope(clone.secondFile?.name, matchers)
    );
    const entries = gated.map((clone) => ({
        lines: clone.lines ?? 0,
        fingerprint: fingerprint(clone.fragment),
        label: `${clone.firstFile?.name}:${clone.firstFile?.start} <-> ${clone.secondFile?.name}:${clone.secondFile?.start}`,
    }));
    return {
        scope,
        clones: entries.length,
        duplicatedLines: entries.reduce((sum, entry) => sum + entry.lines, 0),
        // One fingerprint per clone, duplicates included, so the check can compare multisets
        // and still name a clone whose fragment already appears in the baseline.
        fingerprints: entries.map((entry) => entry.fingerprint).sort(),
        entries,
    };
}

function round2(value) {
    return Math.round(Number(value ?? 0) * 100) / 100;
}

function formatDelta(delta) {
    return delta > 0 ? `+${delta}` : String(delta);
}

export function buildBaseline(report, scope) {
    const total = report.statistics.total;
    const gate = computeGate(report, scope);
    return {
        generatedWith: 'jscpd 5.0.14',
        report: {
            sources: total.sources,
            clones: total.clones,
            duplicatedLines: total.duplicatedLines,
            percentage: round2(total.percentage),
        },
        gate: {
            scope: gate.scope,
            clones: gate.clones,
            duplicatedLines: gate.duplicatedLines,
            fingerprints: gate.fingerprints,
        },
    };
}

function defaultScan() {
    // Delete the previous report first: otherwise a failed scan silently re-reads stale numbers.
    fs.rmSync(REPORT_PATH, { force: true });
    // `shell` on Windows: the bin entry there is a `.cmd` shim, which execFileSync cannot launch.
    execFileSync(JSCPD_BIN, [SCAN_ROOT, '--config', CONFIG_PATH], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
    if (!fs.existsSync(REPORT_PATH)) {
        throw new Error(`jscpd produced no report at ${REPORT_PATH}`);
    }
    // Rewrite in place so everything downstream — this check and anyone reading the report by
    // hand — sees workspace-relative paths rather than paths relative to the scan root.
    const report = rebaseReportPaths(JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')), SCAN_ROOT);
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report));
}

function defaultReadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function defaultWriteJson(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
}

/**
 * Which gated clones are not accounted for by the baseline. Compared as a multiset: a clone
 * whose fragment already appears in the baseline is still new if it appears more often now,
 * which is what triplicating an already-duplicated block looks like.
 */
export function findUnaccountedClones(gate, baselineFingerprints) {
    const available = new Map();
    for (const print of baselineFingerprints) {
        available.set(print, (available.get(print) ?? 0) + 1);
    }
    const byLargest = [...gate.entries].sort((a, b) => b.lines - a.lines);
    const unaccounted = [];
    for (const entry of byLargest) {
        const remaining = available.get(entry.fingerprint) ?? 0;
        if (remaining > 0) {
            available.set(entry.fingerprint, remaining - 1);
        } else {
            unaccounted.push(entry);
        }
    }
    return unaccounted;
}

export function main(argv = [], deps = {}) {
    const {
        scan = defaultScan,
        readJson = defaultReadJson,
        writeJson = defaultWriteJson,
        log = console.log,
        logError = console.error,
        env = process.env,
        reportPath = REPORT_PATH,
        baselinePath = BASELINE_PATH,
    } = deps;

    const update = argv.includes('--update');
    const unknownArgs = argv.filter((arg) => arg !== '--update');
    if (unknownArgs.length > 0) {
        logError(`Unknown argument(s): ${unknownArgs.join(', ')}`);
        logError('Usage: node scripts/ci/jscpd-baseline-check.mjs [--update]');
        return 1;
    }

    try {
        scan();
    } catch (error) {
        logError(`jscpd failed to run: ${error.message}`);
        return 1;
    }

    let report;
    try {
        report = readJson(reportPath);
    } catch (error) {
        logError(`Could not read the jscpd report at ${reportPath}: ${error.message}`);
        return 1;
    }

    const total = report?.statistics?.total;
    if (!total) {
        logError(`The jscpd report at ${reportPath} has no statistics.total block.`);
        return 1;
    }

    // A zero-file scan is the silent-misconfiguration mode: `format` given as a string rather
    // than an array scans nothing and reports 0% duplication. It must never read as a pass.
    if (!(total.sources > 0)) {
        logError('jscpd scanned 0 files. Check the `format` and `ignore` globs in .jscpd.json.');
        return 1;
    }
    if (!Array.isArray(report.duplicates)) {
        logError(`The jscpd report at ${reportPath} has no duplicates array. The report schema has shifted.`);
        return 1;
    }

    let baseline = null;
    let baselineError = null;
    try {
        baseline = readJson(baselinePath);
    } catch (error) {
        baselineError = error;
    }

    const scope = baseline?.gate?.scope ?? DEFAULT_SCOPE;
    if (!Array.isArray(scope) || scope.length === 0) {
        logError(`gate.scope in ${baselinePath} must be a non-empty array of globs.`);
        return 1;
    }
    const unsupported = scope.filter((glob) => UNSUPPORTED_GLOB_SYNTAX.test(String(glob)));
    if (unsupported.length > 0) {
        logError(`gate.scope supports only the * and ** wildcards. Unsupported: ${unsupported.join(', ')}`);
        logError('Widen the scope by listing one glob per directory tree, for example ["packages/**", "testing/**"].');
        logError('Widening the scope also needs SCAN_ROOT in this script to cover the extra tree.');
        return 1;
    }

    const gate = computeGate(report, scope);

    // An empty gated set against a non-empty baseline is a scope or schema problem, not an
    // improvement. Left as a decrease it would exit 0 and, under --update, bake in a dead gate.
    if (gate.clones === 0 && (baseline?.gate?.clones ?? 0) > 0) {
        logError(
            `No clones matched ${scope.join(', ')}, but the baseline records ${baseline.gate.clones}. ` +
                'Check gate.scope and the report rather than treating this as an improvement.'
        );
        return 1;
    }

    if (update) {
        writeJson(baselinePath, buildBaseline(report, scope));
        log(`Updated ${baselinePath}: ${gate.clones} gated clones, ${gate.duplicatedLines} duplicated lines.`);
        return 0;
    }

    if (baselineError) {
        logError(`Could not read the baseline at ${baselinePath}: ${baselineError.message}`);
        logError(`Generate it with: ${UPDATE_COMMAND}`);
        return 1;
    }
    if (typeof baseline?.gate?.clones !== 'number' || typeof baseline?.gate?.duplicatedLines !== 'number') {
        logError(`The baseline at ${baselinePath} has no numeric gate.clones and gate.duplicatedLines.`);
        logError(`Regenerate it with: ${UPDATE_COMMAND}`);
        return 1;
    }

    const clonesDelta = gate.clones - baseline.gate.clones;
    const linesDelta = gate.duplicatedLines - baseline.gate.duplicatedLines;

    log(
        `jscpd: ${total.clones} clones across ${SCAN_ROOT} ` +
            `(${round2(total.percentage)}% of ${total.lines} lines); ${gate.clones} gated in ${scope.join(', ')}.`
    );

    if (clonesDelta > 0 || linesDelta > 0) {
        logError(`Duplicate code increased inside ${scope.join(', ')}.`);
        logError(`  clones:          ${baseline.gate.clones} -> ${gate.clones} (${formatDelta(clonesDelta)})`);
        logError(
            `  duplicatedLines: ${baseline.gate.duplicatedLines} -> ${gate.duplicatedLines} (${formatDelta(linesDelta)})`
        );
        const unaccounted = findUnaccountedClones(gate, baseline.gate.fingerprints ?? []);
        // Fall back to the largest gated clones: a reformat inside an existing clone changes its
        // fingerprint, so an empty unaccounted set still needs to point somewhere useful.
        const listed = unaccounted.length > 0 ? unaccounted : [...gate.entries].sort((a, b) => b.lines - a.lines);
        logError(
            unaccounted.length > 0
                ? 'Clones absent from the baseline (largest first; both sides may be the same file):'
                : 'No unrecognised fragments — an existing clone grew or was reformatted. Largest gated clones:'
        );
        for (const entry of listed.slice(0, MAX_LISTED_CLONES)) {
            logError(`  ${entry.lines} lines  ${entry.label}`);
        }
        logError('Extract the shared code. If the increase is intended, update the baseline deliberately:');
        logError(`  ${UPDATE_COMMAND}`);
        return 1;
    }

    if (clonesDelta < 0 || linesDelta < 0) {
        const message =
            `Duplicate code decreased inside ${scope.join(', ')} ` +
            `(clones ${formatDelta(clonesDelta)}, duplicatedLines ${formatDelta(linesDelta)}). ` +
            `Tighten the baseline with: ${UPDATE_COMMAND}`;
        log(env.CI ? `::notice::${message}` : message);
    }

    return 0;
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
    process.exit(main(process.argv.slice(2)));
}
