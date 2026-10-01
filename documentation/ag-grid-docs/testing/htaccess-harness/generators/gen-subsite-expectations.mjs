#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI generator: writes rows to stdout / status to stderr */
// Expectation rows for a SUBSITE .htaccess - charts (/charts) or studio (/studio), live or an
// archive build below them - with EXACT predicted Locations.
//
// A subsite's .htaccess has its own `RewriteEngine On`, which REPLACES the grid root's rewrite rules
// for every path below it (no RewriteOptions Inherit), so this models the subsite file alone:
//   1. its redirect RewriteRules, first match in file order, matched against the path BELOW the
//      subsite directory (per-dir context): `RewriteRule "<rel>" "<abs>" [R=301,...]` and
//      `RewriteRule "<rel>" - [G]` (410). Not host-gated, so every host gets the same answer;
//   2. the canonicalisation: a slash-less directory URL goes straight to its slashed www URL, and
//      a non-canonical host is swapped to www, both in one hop.
// Rows for each rule: its sample path in both slash forms on www, and the primary sample on the
// apex and the blog host too (one hop to the same www target).
//
// Usage: node gen-subsite-expectations.mjs <emitted .htaccess> --base /charts [--slug bar-series]
import { readFileSync } from 'node:fs';

import { Rows, SampleGaps, knownFailMarker, substitute, synthFromPattern } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (name, dflt) => (args.includes(name) ? args[args.indexOf(name) + 1] : dflt);
const file = args[0];
const base = opt('--base');
const slug = opt('--slug', 'sample');
if (!file || !base) {
    console.error('usage: gen-subsite-expectations.mjs <emitted .htaccess> --base /charts [--slug bar-series]');
    process.exit(2);
}
const text = readFileSync(file, 'utf8');
const SITE = 'https://www.ag-grid.com';

const rules = [];
for (const line of text.split('\n')) {
    let m;
    if ((m = line.match(/^\s*RewriteRule\s+"([^"]+)"\s+"([^"]+)"\s+\[(R=301[^\]]*)\]/))) {
        rules.push({ src: m[1], re: new RegExp(m[1]), status: 301, to: m[2], text: line.trim() });
    } else if ((m = line.match(/^\s*RewriteRule\s+"([^"]+)"\s+-\s+\[G\]/))) {
        rules.push({ src: m[1], re: new RegExp(m[1]), status: 410, to: '', text: line.trim() });
    }
}
// A subsite file with no redirect rules (or one this parser no longer understands) must not yield a
// silently empty row set: the harness's @min-rows check would catch it, but say so here too.
if (!rules.length) {
    console.error(`ERROR: no RewriteRule redirects parsed from ${file}`);
    process.exit(1);
}
if (/^\s*Redirect(Match)?\s/m.test(text)) {
    console.error(`ERROR: ${file} has mod_alias Redirect lines; this generator only models RewriteRule redirects`);
    process.exit(1);
}
const NON_CANONICAL = new RegExp(
    text.match(/RewriteCond %\{HTTP_HOST\} (\^\(\?:ag-grid[^ ]+) \[NC\]/)?.[1] ?? '^(?:ag-grid\\.com)$',
    'i'
);

/** The first response for `path` on `host`, or null when it is served as-is. */
function simulate(path, host) {
    const rel = path.slice(base.length + 1);
    for (const r of rules) {
        const m = rel.match(r.re);
        if (m) {
            return { status: r.status, loc: r.status === 410 ? '' : substitute(r.to, m), by: r };
        }
    }
    const canonicalOrAlias = host === 'www.ag-grid.com' || NON_CANONICAL.test(host);
    if (canonicalOrAlias && /\/+[^.]+$/.test(path) && !path.endsWith('/')) {
        return { status: 301, loc: `${SITE}${path}/`, by: 'slash' };
    }
    if (NON_CANONICAL.test(host)) {
        return { status: 301, loc: `${SITE}${path}`, by: 'host' };
    }
    return null;
}

const HOSTS = { www: 'www.ag-grid.com', apex: 'ag-grid.com', blog: 'blog.ag-grid.com' };
const rows = new Rows();
const gaps = new SampleGaps(`${file} (base ${base})`);
let shadowed = 0;

function rowFor(alias, path, rule) {
    const sim = simulate(path, HOSTS[alias]);
    if (!sim) {
        console.error(`# sample ${path} matches no rule (${rule.text})`);
        return;
    }
    if (sim.by !== rule && typeof sim.by !== 'string') {
        const own = path.slice(base.length + 1).match(rule.re);
        const intended = { status: rule.status, loc: rule.status === 410 ? '' : substitute(rule.to, own) };
        const marker = knownFailMarker(`harness finding: shadowed by an earlier rule (${sim.by.text})`, intended, sim);
        if (marker) {
            shadowed++;
            rows.add(alias, path, intended.status, intended.loc, [marker]);
            return;
        }
        // an earlier rule answers exactly as this one would: that IS the behaviour
    }
    rows.add(alias, path, sim.status, sim.loc);
}

const area = base.includes('/archive/') ? `${base.split('/')[1]}-archive` : base.slice(1);
rows.section(`${area}-redirects`);
for (const r of rules) {
    const full = `${base}/${synthFromPattern(r.src, { slug }).replace(/^\//, '')}`;
    // the same sample without a trailing optional group, e.g. privacy for ^privacy(/.*)?$
    const minimalPattern = r.src.replace(/\((?:[^()]|\([^()]*\))*\)\?(\$?)$/, '$1');
    const minimal = `${base}/${synthFromPattern(minimalPattern, { slug }).replace(/^\//, '')}`;
    const samples = new Set();
    for (const s of [full, minimal]) {
        const noSlash = s.replace(/\/+$/, '');
        for (const form of [noSlash, `${noSlash}/`]) {
            if (r.re.test(form.slice(base.length + 1))) {
                samples.add(form);
            }
        }
    }
    if (!samples.size) {
        gaps.add(r.text, (path) => path.startsWith(`${base}/`) && r.re.test(path.slice(base.length + 1)));
        continue;
    }
    for (const s of samples) {
        rowFor('www', s, r);
    }
    const primary = [...samples][samples.size - 1];
    rowFor('apex', primary, r);
    rowFor('blog', primary, r);
}

gaps.exitIfAny();

process.stdout.write(
    rows.toString([
        `GENERATED by gen-subsite-expectations.mjs --base ${base} - do not hand-edit; regenerate (see README).`,
        `rules: ${rules.length} RewriteRule redirects; rows=${rows.count} (${shadowed} shadowed: known-fail)`,
        `@min-rows ${rows.count}`,
    ])
);
console.error(`# ${file} (base ${base}): ${rules.length} rules, ${rows.count} rows, ${shadowed} shadowed`);
