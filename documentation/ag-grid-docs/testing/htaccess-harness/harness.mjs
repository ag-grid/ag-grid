#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI test harness: reports to stdout */
// Local Apache behavioural harness for the generated .htaccess files of grid, charts and studio.
//
// Emits EVERY .htaccess fresh from source (never from a build output), lays them out as the
// production docroot (root + /charts + /studio + archive builds below each), patches the root's
// in-flight block with the real release script, serves it with the system Apache, and asserts
// status, Location, redirect chains and response headers for every expectation row.
//
// See README.md for usage. Entry point: run.sh (which the Nx target calls).
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { detectApache, findMimeTypes, startHttpd, stopHttpd, writeHttpdConf } from './lib/apache.mjs';
import { buildScaffold, placeRowFiles } from './lib/docroot.mjs';
import { request, runRow } from './lib/probe.mjs';
import { EXPECTATION_FILES, classifyRow, coverageErrors, expectationFileErrors } from './lib/report.mjs';
import { parseFile, siteOf } from './lib/rows.mjs';
import { LAYOUT, emitLayout, resolveSources, tsxEval } from './lib/sources.mjs';

const HARNESS_DIR = fileURLToPath(new URL('.', import.meta.url));
const MAIN_REPO = resolve(HARNESS_DIR, '../../../..');
const env = process.env;

// ---------------------------------------------------------------- options
let htaccessEnv = env.HTACCESS_ENV || 'production';
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--env') {
        htaccessEnv = argv[++i];
    } else if (argv[i].startsWith('--env=')) {
        htaccessEnv = argv[i].slice(6);
    }
}
if (!['staging', 'production'].includes(htaccessEnv)) {
    console.error(`invalid --env '${htaccessEnv}' (use staging|production)`);
    process.exit(1);
}
const PORT = Number(env.PORT || 8899);
// the plain-http listener, for rows with scheme=http
const HTTP_PORT = Number(env.HTTP_PORT || PORT + 1);
const WORK = env.HARNESS_WORK || join(env.TMPDIR || '/tmp', 'ag-htaccess-harness');
const HTDOCS = join(WORK, 'htdocs');
const flag = (name) => env[name] === '1' || env[name] === 'true';

// ---------------------------------------------------------------- Apache (the ONLY skip)
const apache = detectApache();
if (apache.skip) {
    if (flag('HTTPD_REQUIRED')) {
        console.error(`ERROR: ${apache.skip} (HTTPD_REQUIRED=1)`);
        process.exit(1);
    }
    console.log(`==> SKIP test:htaccess - ${apache.skip}.`);
    console.log(
        '    Install Apache (macOS: built-in; Debian/Ubuntu: apt-get install apache2; RHEL: yum install httpd)'
    );
    console.log('    with mod_rewrite/mod_alias/mod_headers, or set HTTPD=/HTTPD_MODULES= to run the harness.');
    process.exit(0);
}
const mimeTypes = findMimeTypes();
console.log(`==> httpd: ${apache.httpd} ; modules: ${apache.modsDir} ; mime: ${mimeTypes}`);
// An optional module is the one other gap allowed, and only for the rows that need it: reported
// in COVERAGE, and an error under HTTPD_REQUIRED=1.
for (const [feature, state] of Object.entries(apache.features)) {
    if (state !== true) {
        if (flag('HTTPD_REQUIRED')) {
            console.error(`ERROR: optional feature ${feature} unavailable: ${state} (HTTPD_REQUIRED=1)`);
            process.exit(1);
        }
        console.log(`==> WARNING: ${feature} unavailable (${state}); rows with needs=${feature} are skipped`);
    }
}

rmSync(WORK, { recursive: true, force: true });
mkdirSync(join(WORK, 'logs'), { recursive: true });
mkdirSync(HTDOCS, { recursive: true });

// ---------------------------------------------------------------- sources + emit
const resolved = resolveSources({ mainRepo: MAIN_REPO, work: WORK, htaccessEnv, env });
if (resolved.errors) {
    for (const e of resolved.errors) {
        console.error(`ERROR: ${e}`);
    }
    process.exit(1);
}
const { sites, src, coverage } = resolved;
for (const [site, s] of Object.entries(src)) {
    console.log(`==> ${site.padEnd(6)} source: ${s.label}`);
}

// The canonical host for the env, from the grid's URL_CONFIG (single source of truth).
const siteHost = tsxEval(
    src.grid.pkgDir,
    "import('./src/constants.ts').then(m => process.stdout.write(m.URL_CONFIG[process.env.HENV].hosts[0]))",
    { PUBLIC_BASE_URL: '', HENV: htaccessEnv }
).trim();
if (!siteHost) {
    console.error(`could not resolve the site host from URL_CONFIG for env '${htaccessEnv}'`);
    process.exit(1);
}
console.log(`==> env=${htaccessEnv}  site=https://${siteHost}`);

const { emitted, patched } = emitLayout(src, HTDOCS);
console.log(`==> in-flight (scripts/uncached-archives.mjs): ${patched}`);

// Scope B for staging: the rules carry the production host; map it to the env's host in every
// served file (and, in probe.mjs, in the expectations), so the two stay consistent.
if (siteHost !== 'www.ag-grid.com') {
    for (const { file } of emitted) {
        writeFileSync(file, readFileSync(file, 'utf8').replaceAll('https://www.ag-grid.com', `https://${siteHost}`));
    }
}

// ---------------------------------------------------------------- rows
const EXPECTATIONS = join(HARNESS_DIR, 'expectations');
// Every entry in the directory, not just *.tsv: a file renamed away from .tsv must still be caught.
const present = readdirSync(EXPECTATIONS).sort();
const fileErrors = expectationFileErrors(present);
if (fileErrors.length) {
    console.error(`FAIL: expectation files:\n  ${fileErrors.join('\n  ')}`);
    process.exit(1);
}
const files = EXPECTATION_FILES;
const all = [];
const minRows = {};
const declared = [];
for (const f of files) {
    const { rows, directives } = parseFile(join(EXPECTATIONS, f));
    minRows[f] = directives.minRows;
    declared.push(...directives.categories);
    all.push(...rows);
}
const active = [];
const skipped = [];
const skippedByFeature = {};
for (const row of all) {
    const site = siteOf(row);
    const unknown = row.needs.find((f) => !(f in apache.features));
    if (unknown) {
        console.error(`${row.file}:${row.line}: unknown needs=${unknown}`);
        process.exit(1);
    }
    const unmet = row.needs.find((f) => apache.features[f] !== true);
    if (sites[site].off) {
        skipped.push(row);
    } else if (unmet) {
        skipped.push(row);
        skippedByFeature[unmet] = (skippedByFeature[unmet] ?? 0) + 1;
    } else {
        active.push(row);
    }
}

buildScaffold(HTDOCS, {
    gridArchives: LAYOUT.gridArchives,
    charts: !!src.charts,
    chartsArchives: LAYOUT.chartsArchives,
    studio: !!src.studio,
    studioArchives: LAYOUT.studioArchives,
});
placeRowFiles(HTDOCS, active, PORT);

// ---------------------------------------------------------------- serve + assert
const conf = writeHttpdConf({
    work: WORK,
    htdocs: HTDOCS,
    port: PORT,
    httpPort: HTTP_PORT,
    loadModules: apache.loadModules,
    mimeTypes,
});
try {
    startHttpd(apache.httpd, conf);
} catch (e) {
    console.error('httpd failed to start');
    console.error(e.stderr?.toString() ?? e.message);
    if (existsSync(join(WORK, 'logs/error.log'))) {
        console.error(readFileSync(join(WORK, 'logs/error.log'), 'utf8'));
    }
    process.exit(1);
}
let stopped = false;
const stop = () => {
    if (!stopped && !flag('KEEP_RUNNING')) {
        stopped = true;
        stopHttpd(apache.httpd, conf);
    }
};
process.on('exit', stop);
for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => process.exit(130));
}
await waitForPort();

const ctx = { port: PORT, httpPort: HTTP_PORT, siteHost, extraHosts: [siteHost] };
const results = new Array(active.length);
let next = 0;
async function worker() {
    while (next < active.length) {
        const i = next++;
        const row = active[i];
        try {
            results[i] = await runRow(row, ctx);
        } catch (e) {
            // A transport error is never an expected failure: no known-fail can name it.
            results[i] = { fails: [{ key: 'error', message: `error: ${e.message}` }] };
        }
    }
}
await Promise.all(Array.from({ length: 8 }, worker));

// ---------------------------------------------------------------- report
const verbose = flag('VERBOSE');
const tally = {};
const failed = [];
const knownFailed = [];
const unexpectedPass = [];
let formOnlyFails = 0;
const messages = (fails) => fails.map((fail) => fail.message).join('\n        ');
active.forEach((row, i) => {
    const t = (tally[row.category] ??= { sites: new Set(), pass: 0, fail: 0, known: 0, unexpected: 0 });
    t.sites.add(siteOf(row));
    const where = `${row.file}:${row.line} ${row.scheme === 'http' ? 'http://' : ''}${row.hostAlias} ${row.path}${row.accept === 'text/markdown' ? ' [md]' : ''}`;
    const result = classifyRow(row, results[i].fails);
    const named = row.knownFail && `known-fail ${row.knownFail.assertions.join(',')}: ${row.knownFail.ref}`;
    if (result.kind === 'known') {
        t.known++;
        knownFailed.push(`${where}\n        ref: ${row.knownFail.ref}\n        ${messages(result.fails)}`);
    } else if (result.kind === 'unexpected') {
        t.unexpected++;
        unexpectedPass.push(`${where}  (${named}; passed: ${result.passing.join(', ')})`);
    } else if (result.kind === 'fail') {
        t.fail++;
        formOnlyFails += results[i].formOnly && !row.knownFail ? 1 : 0;
        failed.push(
            `${where}${named ? `  (${named}, but other assertions failed)` : ''}\n        ${messages(result.fails)}`
        );
    } else {
        t.pass++;
        if (verbose) {
            console.log(`PASS ${where}`);
        }
    }
});
const siteSkipped = skipped.filter((r) => sites[siteOf(r)].off);
const skippedBySite = {};
for (const row of siteSkipped) {
    skippedBySite[siteOf(row)] = (skippedBySite[siteOf(row)] ?? 0) + 1;
}

const coverageGaps = coverageErrors({ declared, minRows, executed: active, siteSkipped });

if (failed.length) {
    console.log(`\n==> FAILURES (${failed.length})`);
    console.log(failed.map((f) => `  FAIL ${f}`).join('\n'));
}
if (unexpectedPass.length) {
    console.log(`\n==> UNEXPECTED PASSES (${unexpectedPass.length}) - promote these rows (drop known-fail=)`);
    console.log(unexpectedPass.map((f) => `  UPASS ${f}`).join('\n'));
}
if (knownFailed.length) {
    console.log(`\n==> KNOWN FAILURES (${knownFailed.length}) - approved behaviour not implemented yet`);
    console.log(knownFailed.map((f) => `  KFAIL ${f}`).join('\n'));
}

console.log('\n==> COVERAGE');
for (const site of ['grid', 'charts', 'studio']) {
    console.log(
        `  ${site.padEnd(6)} ${coverage[site]}${skippedBySite[site] ? ` - ${skippedBySite[site]} rows skipped` : ''}`
    );
}
for (const [feature, state] of Object.entries(apache.features)) {
    const n = skippedByFeature[feature];
    console.log(
        `  ${feature.padEnd(6)} ${state === true ? 'tested' : `NOT TESTED (${state})`}${n ? ` - ${n} rows skipped` : ''}`
    );
}
console.log('  .htaccess files emitted from source:');
for (const e of emitted) {
    console.log(`    ${e.site.padEnd(6)} ${e.base.padEnd(24)} ${e.bytes} bytes`);
}
console.log(`  in-flight archives: grid ${LAYOUT.gridInFlight}, charts ${LAYOUT.chartsInFlight}`);
console.log('\n  category                                   sites               pass  fail  known  upass');
for (const [cat, t] of Object.entries(tally)) {
    console.log(
        `  ${cat.padEnd(42)} ${[...t.sites].join(',').padEnd(18)} ${String(t.pass).padStart(5)} ${String(t.fail).padStart(5)} ${String(t.known).padStart(6)} ${String(t.unexpected).padStart(6)}`
    );
}
const totals = Object.values(tally).reduce(
    (a, t) => ({
        pass: a.pass + t.pass,
        fail: a.fail + t.fail,
        known: a.known + t.known,
        upass: a.upass + t.unexpected,
    }),
    { pass: 0, fail: 0, known: 0, upass: 0 }
);
for (const c of coverageGaps) {
    console.log(`  COVERAGE ERROR: ${c}`);
}
console.log(
    `\n==> ${totals.pass} passed, ${totals.fail} failed, ${totals.known} known-fail, ${totals.upass} unexpected-pass, ${skipped.length} skipped`
);
if (formOnlyFails) {
    console.log(
        `    (${formOnlyFails} of the failures differ only in Location form on the canonical host - relative vs absolute, same page)`
    );
}
const anyChildOff = Object.values(sites).some((s) => s.off);
const anyFeatureOff = Object.values(apache.features).some((state) => state !== true);
if ((anyChildOff && htaccessEnv === 'production') || anyFeatureOff) {
    console.log(
        '==> WARNING: PARTIAL COVERAGE - see COVERAGE above. This run does not vouch for the skipped sites or features.'
    );
}
if (flag('KEEP_RUNNING')) {
    console.log(`httpd left running on :${PORT} and :${HTTP_PORT} (http) (stop: ${apache.httpd} -f ${conf} -k stop)`);
}
// explicit exit: the keep-alive agent would otherwise hold the process open
process.exit(totals.fail || totals.upass || coverageGaps.length ? 1 : 0);

async function waitForPort() {
    for (let i = 0; i < 50; i++) {
        try {
            await request({ port: PORT, host: 'www.ag-grid.com', path: '/', accept: null });
            return;
        } catch {
            await new Promise((r) => setTimeout(r, 100));
        }
    }
    console.error(`httpd did not answer on :${PORT}`);
    console.error(readFileSync(join(WORK, 'logs/error.log'), 'utf8'));
    process.exit(1);
}
