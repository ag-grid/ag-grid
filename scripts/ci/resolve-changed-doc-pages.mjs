// Maps a commit range onto the docs-page Playwright filters that cover it.
//
// Specs are co-located with the pages they test
// (src/content/docs/<page>/_examples/<example>/example.spec.ts) and Playwright's testDir is
// src/content/docs/, so a changed file's path *is* the filter — no page-to-spec table to keep
// in sync. Emits one `content/docs/<page>/` regex per changed page, which Playwright ORs.
//
// Usage: node scripts/ci/resolve-changed-doc-pages.mjs <baseSha> <headSha>
//
// Outputs (GITHUB_OUTPUT, when set): patterns, count. Both are empty/0 when there is nothing
// to test, including when the range cannot be read; the step summary says which.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DOCS_ROOT = 'documentation/ag-grid-docs/src/content/docs';

const [baseSha, headSha] = process.argv.slice(2);
if (!headSha) {
    console.error('::error title=Changed doc pages::Usage: resolve-changed-doc-pages.mjs <baseSha> <headSha>');
    process.exit(1);
}

function git(...args) {
    return execFileSync('git', args, { encoding: 'utf8' });
}

function hasMergeBase(a, b) {
    try {
        // A shallow checkout can hold both ends of the range without holding their common
        // ancestor, and a three-dot diff needs it. stdio ignored so git's "fatal:" does not
        // surface in the log as if the run had broken.
        execFileSync('git', ['merge-base', a, b], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function hasSpec(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return false; // deleted in this range
    }
    return entries.some((entry) =>
        entry.isDirectory() ? hasSpec(path.join(dir, entry.name)) : entry.name.endsWith('.spec.ts')
    );
}

function finish(patterns, summary) {
    console.log(summary);
    if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
    }
    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `patterns=${patterns.join(' ')}\ncount=${patterns.length}\n`);
    }
}

if (!baseSha) {
    finish([], `### Nothing to test\n\nNo previous deploy to diff \`${headSha}\` against.`);
    process.exit(0);
}

// Deliberately NOT falling back to running the whole suite: that is the nightly's job, and a
// silent full run here would be a 90-minute surprise.
if (!hasMergeBase(baseSha, headSha)) {
    console.log('::warning title=Changed doc pages::Range unavailable in this shallow checkout.');
    finish(
        [],
        `### Nothing to test\n\nCould not read \`${baseSha}...${headSha}\`: no common ancestor in this checkout.`
    );
    process.exit(0);
}

// Three-dot, i.e. diff against the merge base rather than the two endpoints. On latest the
// range is linear and the two agree, but on a branch whose base has moved on, a two-dot diff
// reports every upstream change in between as though this range had made it - inverted - and
// would select pages this commit never touched.
const changed = git('diff', '--name-only', `${baseSha}...${headSha}`).split('\n').filter(Boolean);

// A page directory is the single segment under DOCS_ROOT. The specs sitting directly inside
// DOCS_ROOT (example-demos, example-source-code, ...) sweep across every page rather than
// belonging to one, so no changed directory selects them and a filtered run does not pretend to
// cover them. page-verification.spec.ts is excluded from the browser projects outright —
// post-deploy-verification.yml owns it.
const pages = new Set();
for (const file of changed) {
    const rel = file.startsWith(`${DOCS_ROOT}/`) ? file.slice(DOCS_ROOT.length + 1) : '';
    if (rel.includes('/')) {
        pages.add(rel.split('/')[0]);
    }
}

// A page whose examples carry no spec contributes no tests; including it would make Playwright
// exit "no tests found" and fail the run on a docs change that simply has nothing to verify.
const sorted = [...pages].sort();
const withSpecs = sorted.filter((page) => hasSpec(path.join(DOCS_ROOT, page)));
const skipped = sorted.filter((page) => !withSpecs.includes(page));

const lines = withSpecs.length
    ? [`### Testing ${withSpecs.length} changed doc page(s)`, '', ...withSpecs.map((p) => `- ${p}`)]
    : ['### No changed doc pages with tests'];
if (skipped.length) {
    lines.push('', `Changed but without specs: ${skipped.join(', ')}`);
}
lines.push('', `Range: \`${baseSha}...${headSha}\``);

finish(
    withSpecs.map((page) => `content/docs/${page}/`),
    lines.join('\n')
);
