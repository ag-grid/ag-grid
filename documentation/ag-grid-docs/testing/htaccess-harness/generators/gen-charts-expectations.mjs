#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI generator: writes rows to stdout / status to stderr */
// Generate behavioural expectation rows for the CHARTS /charts redirect rules.
//
// Parses the rendered charts redirect block (Redirect 301 / RedirectMatch 301 / RedirectMatch 410,
// all base-aware so they already carry the /charts prefix) and, for each rule, emits a concrete
// matching request path + expected status + expected Location substring.
//
// Apache nuance encoded here (the charts .htaccess is mod_alias-only and lives in the /charts subdir;
// the MAIN docroot .htaccess owns mod_rewrite, including the parent "add trailing slash" rule):
//   - A trailing-slashed request (e.g. /charts/core/bar-series/) is matched DIRECTLY by the charts
//     mod_alias rule → single hop to the target. We assert that.
//   - A slash-less, dot-less request (e.g. /charts/privacy) is first 301'd by the parent
//     trailing-slash rule to add "/", THEN the charts rule fires on the next request. So the SINGLE
//     response we observe is a 301 whose Location just adds the slash (NOT the final target).
//     We assert that first hop for no-slash variants.
//   - mod_alias is FIRST-match (config order). For the broad family rules we pick a path that no
//     earlier rule in the file matches, so the row proves the intended rule.
//
// Usage: node gen-charts-expectations.mjs <charts_redirect_rules.txt> > charts_generated.tsv
import { readFileSync } from 'node:fs';

const rulesFile = process.argv[2];
if (!rulesFile) {
    console.error('usage: gen-charts-expectations.mjs <charts_redirect_rules.txt>');
    process.exit(2);
}
const lines = readFileSync(rulesFile, 'utf8').split('\n').filter(Boolean);

// Parent-docroot interceptions: the MAIN .htaccess (mod_rewrite, runs at docroot level BEFORE the
// charts subdir mod_alias) carries SE-64/SE-66 single-hop rules for a few specific /charts/* paths.
// Where one exists, it wins over the charts rule, so the observed response is the parent's host-swap.
// Keyed by exact request path → { status, loc }. (Verified against the rendered main_full.htaccess.)
const PARENT_OVERRIDES = {
    '/charts/react/bullet-series/': { status: '301', loc: 'https://www.ag-grid.com/charts/react/bullet-series/' },
};

const rows = [];
const seenPaths = new Set();
const add = (path, status, loc = '', note = '') => {
    if (seenPaths.has(path)) {
        return; // first rule that matches a path wins in Apache; don't emit conflicting rows
    }
    seenPaths.add(path);
    const override = PARENT_OVERRIDES[path];
    if (override) {
        rows.push({ path, status: override.status, loc: override.loc, note: `${note} (parent .htaccess intercepts)` });
        return;
    }
    rows.push({ path, status, loc, note });
};

// Build a concrete request path that matches a given fromPattern. We craft realistic paths from the
// actual legacy-URL corpus rather than mechanically appending a slug, so the rows read like real
// requests and the chosen slugs resolve on the live charts site.
const SLUG = 'bar-series'; // a real docs slug present for every framework

// Realistic concrete suffixes per legacy family, keyed by a substring of the pattern.
// Each maps the captured remainder to something that exists, so $1 targets resolve.
function concreteForPattern(pattern) {
    let p = pattern.replace(/^\^/, '');
    // Resolve framework alternations / char-classes to a concrete framework first.
    p = p.replace(/\((?:[a-z]+\|)+[a-z]+\)/g, (m) => m.slice(1, -1).split('|')[0]); // (a|b|c) → a
    p = p.replace(/\[a-z\]\+/g, 'javascript'); // [a-z]+ → javascript

    // Family-specific realistic completions (most specific first).
    // Archive index: the rule is bare-only (`^/charts/archive/?$`) — it redirects the archive
    // landing to /documentation-archive and must NOT match versioned paths (`/archive/<v>/…`),
    // which stay live. Synthesise the bare path so the rule fires.
    if (p.startsWith('/charts/archive')) {
        return '/charts/archive/';
    }
    // 410 privacy: bare page.
    if (p.startsWith('/charts/privacy')) {
        return '/charts/privacy/';
    }
    // server-side-rendering: bare framework-agnostic page.
    if (p.startsWith('/charts/server-side-rendering')) {
        return '/charts/server-side-rendering/';
    }
    // {fw}-charts/gallery|options/...  → a real legacy gallery/options page.
    if (/\/charts\/javascript-charts\/(gallery|options)/.test(p)) {
        return p.includes('gallery') ? '/charts/javascript-charts/gallery/' : '/charts/javascript-charts/options/';
    }
    // {fw}-charts/{fw}/(.*) → a real legacy framework-docs page.
    let mm;
    if ((mm = p.match(/^\/charts\/([a-z]+)-charts\/([a-z]+)\/\(\.\*\)$/))) {
        return `/charts/${mm[1]}-charts/${mm[2]}/${SLUG}/`;
    }
    // enterprise-charts.* / {fw}-charts.* catch-alls → a real legacy page under that prefix.
    if ((mm = p.match(/^\/charts\/([a-z-]+-charts)\.\*$/))) {
        return `/charts/${mm[1]}/license-pricing/`;
    }
    // core/(.*) and side/(.*) → a real legacy framework-agnostic doc page.
    if ((mm = p.match(/^\/charts\/(core|side)\/\(\.\*\)$/))) {
        return `/charts/${mm[1]}/${SLUG}/`;
    }
    // {fw}/series(/.*)? and {fw}/axes(/.*)? → the bare aggregate index page.
    if ((mm = p.match(/^\/charts\/([a-z]+)\/(series|axes)\(\/\.\*\)\?$/))) {
        return `/charts/${mm[1]}/${mm[2]}/`;
    }
    // Bare framework landing "/?$".
    p = p.replace(/\/\?\$$/, '/');
    // Generic fallbacks.
    p = p.replace(/\(\/\.\*\)\?$/, '/');
    p = p.replace(/\(\.\*\)$/, `${SLUG}/`);
    p = p.replace(/\.\*$/, `${SLUG}/`);
    p = p.replace(/\$$/, '');
    return p;
}

// Resolve the concrete Location target for a RedirectMatch 301 given the concrete request path.
function targetFor(pattern, to, reqPath) {
    const re = new RegExp(pattern);
    const m = reqPath.match(re);
    if (!m) {
        return to; // shouldn't happen; fall back to literal target
    }
    return to.replace(/\$(\d)/g, (_, n) => m[Number(n)] ?? '');
}

for (const line of lines) {
    let mm;
    if ((mm = line.match(/^Redirect 301 (\S+) (\S+)$/))) {
        // mod_alias `Redirect` is a PREFIX match. `from` already carries the /charts base.
        const [, from, to] = mm;
        const fromIsDotless = !from.split('/').pop().includes('.');
        if (from.endsWith('/')) {
            // Already trailing-slashed (e.g. SE-60 /charts/javascript/toolbar/): direct prefix hit.
            add(from, '301', to, 'SE-60 simple (trailing slash)');
        } else if (fromIsDotless) {
            // Dot-less, slash-less prefix (e.g. /charts/javascript/bullet-series): the parent
            // trailing-slash rule adds "/" FIRST (observed single hop), then on the slashed form the
            // charts prefix rule fires and the matched trailing "/" is appended to the target.
            add(`${from}/`, '301', `${to}/`, 'simple prefix: trailing-slash form hits charts rule');
            add(from, '301', `${from}/`, 'simple prefix: no-slash first hop adds trailing slash');
        } else {
            add(from, '301', to, 'SE-60 simple');
        }
    } else if ((mm = line.match(/^RedirectMatch 410 "([^"]+)"$/))) {
        const [, pattern] = mm;
        const reqSlash = concreteForPattern(pattern);
        add(reqSlash, '410', '', '410 direct (trailing-slash form)');
        // no-slash variant: parent trailing-slash rule adds "/" first (single observed hop = 301 add-slash)
        if (reqSlash.endsWith('/')) {
            const noSlash = reqSlash.replace(/\/$/, '');
            add(noSlash, '301', `${noSlash}/`, '410 family: no-slash first hop adds trailing slash');
        }
    } else if ((mm = line.match(/^RedirectMatch 301 "([^"]+)" "([^"]+)"$/))) {
        const [, pattern, to] = mm;
        const reqSlash = concreteForPattern(pattern);
        const target = targetFor(pattern, to, reqSlash);
        add(reqSlash, '301', target, 'RedirectMatch direct');
        if (reqSlash.endsWith('/')) {
            const noSlash = reqSlash.replace(/\/$/, '');
            add(noSlash, '301', `${noSlash}/`, 'no-slash first hop adds trailing slash');
        }
    }
}

// --- NO-SHADOW rows: live charts pages that must stay 200 and not be swallowed by a broad rule. ---
const noShadow = [
    '/charts/react/bar-series/',
    '/charts/javascript/quick-start/',
    '/charts/angular/area-series/',
    '/charts/vue/line-series/',
    '/charts/gallery/',
    '/charts/options/',
];
for (const p of noShadow) {
    add(p, '200', '', 'no-shadow: live page');
}

// --- Emit TSV ---
const out = [];
out.push('# host\tpath\texpect_status\texpect_location_substring');
out.push('# GENERATED by gen-charts-expectations.mjs from the rendered charts redirect rules.');
out.push('# host=www for all; charts is served from the /charts subdir .htaccess (mod_alias, first-match).');
out.push('# Trailing-slash form = direct charts-rule hit; no-slash form = parent trailing-slash 301 first.');
for (const r of rows) {
    out.push(`www\t${r.path}\t${r.status}\t${r.loc}`);
}
process.stdout.write(out.join('\n') + '\n');
console.error(`generated ${rows.length} rows from ${lines.length} rules`);
