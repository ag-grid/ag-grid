// Maps a commit range onto the docs-page Playwright filters that cover it.
//
// Specs are co-located with the pages they test
// (src/content/docs/<page>/_examples/<example>/example.spec.ts) and Playwright's testDir is
// src/content/docs/, so a changed file's path *is* the filter — no page-to-spec table to keep
// in sync. Emits one `content/docs/<page>/` regex per changed page, which Playwright ORs.
//
// Usage: node scripts/ci/resolve-changed-doc-pages.mjs <baseSha> <headSha>
//
// Outputs (GITHUB_OUTPUT, when set): patterns, pages, count, has_tests.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DOCS_ROOT = 'documentation/ag-grid-docs/src/content/docs';

function fail(message) {
    console.error(`::error title=Changed doc pages::${message}`);
    process.exit(1);
}

const [baseSha, headSha] = process.argv.slice(2);
if (!headSha) {
    fail('Usage: resolve-changed-doc-pages.mjs <baseSha> <headSha>');
}

function git(...args) {
    return execFileSync('git', args, { encoding: 'utf8' });
}

function hasCommit(sha) {
    try {
        // stdio ignored: git writes "fatal: Not a valid object name" to stderr, which would
        // otherwise surface in the log as if the run had broken.
        execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// A shallow or force-pushed baseline is not an error worth failing the run over — it just means
// there is no range to diff, so there is nothing to test rather than everything to test.
// Deliberately NOT falling back to "run the whole suite": that is the nightly's job, and a
// silent full run here would be a 90-minute surprise.
if (!baseSha || baseSha === headSha || !hasCommit(baseSha) || !hasCommit(headSha) || !hasMergeBase(baseSha, headSha)) {
    const why = !baseSha
        ? 'no previous run to diff against'
        : baseSha === headSha
          ? 'the deployed commit is unchanged since the last run'
          : 'the range has no common ancestor in this (shallow) checkout';
    console.log(`No commit range to inspect: ${why}.`);
    writeOutputs({ patterns: '', pages: '', count: 0, has_tests: 'false' });
    process.exit(0);
}

// Three-dot, i.e. diff against the merge base rather than the two endpoints. On latest the
// range is linear and the two agree, but on a branch whose base has moved on, a two-dot diff
// reports every upstream change in between as though this range had made it - inverted - and
// would select pages this commit never touched.
function hasMergeBase(a, b) {
    try {
        // A shallow checkout can hold both ends of the range without holding their common
        // ancestor, and a three-dot diff needs it.
        execFileSync('git', ['merge-base', a, b], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

const changed = git('diff', '--name-only', `${baseSha}...${headSha}`).split('\n').filter(Boolean);

// A page directory is the single segment under DOCS_ROOT. The specs sitting directly inside
// DOCS_ROOT (example-demos, example-source-code, ...) sweep across every page rather than
// belonging to one, so no changed directory selects them and a filtered run does not pretend to
// cover them. page-verification.spec.ts is excluded from the browser projects outright —
// post-deploy-verification.yml owns it.
const pages = new Set();
for (const file of changed) {
    if (!file.startsWith(`${DOCS_ROOT}/`)) {
        continue;
    }
    const [page, ...rest] = file.slice(DOCS_ROOT.length + 1).split('/');
    if (rest.length === 0) {
        continue;
    }
    pages.add(page);
}

// A page whose examples carry no spec contributes no tests; including it would make Playwright
// exit "no tests found" and fail the run on a docs change that simply has nothing to verify.
const withSpecs = [...pages].sort().filter((page) => hasSpec(path.join(DOCS_ROOT, page)));

function hasSpec(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return false; // deleted in this range
    }
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (hasSpec(path.join(dir, entry.name))) {
                return true;
            }
        } else if (entry.name.endsWith('.spec.ts')) {
            return true;
        }
    }
    return false;
}

const patterns = withSpecs.map((page) => `content/docs/${page}/`);

const skipped = [...pages].sort().filter((page) => !withSpecs.includes(page));
console.log(`Changed doc pages: ${pages.size || 'none'}`);
if (withSpecs.length) {
    console.log(`  with specs: ${withSpecs.join(', ')}`);
}
if (skipped.length) {
    console.log(`  without specs (skipped): ${skipped.join(', ')}`);
}

writeOutputs({
    patterns: patterns.join(' '),
    pages: withSpecs.join(','),
    count: withSpecs.length,
    has_tests: String(withSpecs.length > 0),
});

function writeOutputs(outputs) {
    if (!process.env.GITHUB_OUTPUT) {
        return;
    }
    const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}
