#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI generator: writes rows to stdout / status to stderr */
// Expectation rows for the GRID .htaccess (the docroot root, or a grid archive build), one or more
// per redirect rule, with EXACT predicted Locations.
//
// The prediction models the request path through the rules in the order Apache applies them:
//   1. mod_rewrite (per-dir, runs first): the SE-64/66 single-hop rewrites (in an archive, the
//      subset rebased onto the archive's own copy of each target), the index.php strips, the add-trailing-slash rule for a dot-less slash-less path, the .php
//      path-suffix strip;
//   2. mod_alias, FIRST match in config order (not longest match): `Redirect` is a segment-prefix
//      match that APPENDS the unmatched remainder to the target; `RedirectMatch` is a regex with
//      $N substitution and no append.
// /charts/* and /studio/* are not modelled here: their child .htaccess replaces these rewrite rules
// (see gen-subsite-expectations.mjs).
//
// What a rule's author INTENDED is its own target. Where Apache will do something else, the row
// asserts the intended Location and is marked known-fail, so the defect is reported rather than
// frozen in as "expected":
//   - double-slash: a slash-less `from` with a slashed `to` appends the request's trailing slash,
//     giving `<to>/` + `/`.
//   - shadowed: an earlier, broader rule answers first with a different Location.
//
// Usage: node gen-main-expectations.mjs <emitted .htaccess> [--base /archive/36.2.0]
import { readFileSync } from 'node:fs';

import { Rows, collapseSlashes, knownFailMarker, substitute, synthFromPattern } from './lib.mjs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--base');
const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : '';
if (!file) {
    console.error('usage: gen-main-expectations.mjs <emitted .htaccess> [--base /archive/<v>]');
    process.exit(2);
}
const lines = readFileSync(file, 'utf8').split('\n');
const SITE = 'https://www.ag-grid.com';

// ---------------------------------------------------------------- parse
const singleHop = new Map(); // from -> to
const alias = []; // { kind: 'prefix'|'regex', status, from|re, to, text }
for (const line of lines) {
    let m;
    if ((m = line.match(/^\s*RewriteRule\s+"\^\/\?(.+?)\$"\s+"([^"]+)"\s+\[R=301(?:,NE)?,L\]/))) {
        // literal single-hop rewrites only (the per-dir pattern, so the same `from` in an archive)
        if (!/[()|[\]{}+*?]/.test(m[1])) {
            singleHop.set('/' + m[1].replace(/\\\./g, '.'), m[2]);
        }
    } else if ((m = line.match(/^\s*Redirect (301|410)\s+(\S+)(?:\s+(\S+))?\s*$/))) {
        alias.push({ kind: 'prefix', status: Number(m[1]), from: m[2], to: m[3] ?? '', text: line.trim() });
    } else if ((m = line.match(/^\s*RedirectMatch (301|302|410)\s+"?([^"\s]+)"?(?:\s+"?([^"\s]+)"?)?\s*$/))) {
        alias.push({
            kind: 'regex',
            status: Number(m[1]),
            re: new RegExp(m[2]),
            src: m[2],
            to: m[3] ?? '',
            text: line.trim(),
        });
    }
}

// ---------------------------------------------------------------- model
const prefixMatches = (path, from) =>
    path === from || (path.startsWith(from) && (from.endsWith('/') || path[from.length] === '/'));

/** What a directive answers for a path, or null when it does not match. */
function apply(d, path) {
    if (d.kind === 'prefix') {
        if (!prefixMatches(path, d.from)) {
            return null;
        }
        return { status: d.status, loc: d.status === 410 ? '' : d.to + path.slice(d.from.length), by: d };
    }
    const m = path.match(d.re);
    if (!m) {
        return null;
    }
    return { status: d.status, loc: d.status === 410 ? '' : substitute(d.to, m), by: d };
}

/** The first response for a www request, or null for "served/404". */
function simulate(path) {
    const rel = path.slice(base.length + 1); // per-dir path below the .htaccess directory
    if (path.startsWith(`${base}/`) && singleHop.has(`/${rel}`)) {
        return { status: 301, loc: singleHop.get(`/${rel}`), by: 'single-hop' };
    }
    if (rel === 'index.php') {
        return { status: 301, loc: `${base}/`, by: 'index.php' };
    }
    let m;
    if ((m = rel.match(/^(.*)\/index\.php$/))) {
        return { status: 301, loc: `${base}/${m[1]}/`, by: 'index.php' };
    }
    if (/\/+[^.]+$/.test(path) && /^(.+[^/])$/.test(rel)) {
        return { status: 301, loc: `${path}/`, by: 'slash' };
    }
    if ((m = rel.match(/^(.*)\.php(\/.+)$/))) {
        return { status: 301, loc: `${base}/${m[1]}.php`, by: 'php-path' };
    }
    for (const d of alias) {
        const r = apply(d, path);
        if (r) {
            return r;
        }
    }
    return null;
}

const rows = new Rows();
const counts = { ok: 0, doubleSlash: 0, shadowed: 0 };

/** Follow a chain of www responses to its end (at most 5 hops). */
function finalOf(loc) {
    let current = loc;
    for (let i = 0; i < 5; i++) {
        const path = current.replace(/^https:\/\/www\.ag-grid\.com/, '');
        if (!path.startsWith('/')) {
            return current;
        }
        const next = simulate(path);
        if (!next || next.status !== 301) {
            return path;
        }
        current = next.loc;
    }
    return current;
}

/**
 * One row for request `path` generated from directive `d`, asserting what `d` intends. `synthetic`
 * marks a request made up to exercise the prefix append (a /child/ below a renamed page): no rule
 * author had an intent for it, so its row records Apache's mechanics instead.
 */
function rowFor(path, d, { synthetic = false } = {}) {
    const sim = simulate(path);
    if (!sim) {
        console.error(`# no rule matches generated sample ${path} (from: ${d.text})`);
        return;
    }
    if (sim.by === d) {
        const intended = collapseSlashes(sim.loc);
        if (intended !== sim.loc) {
            counts.doubleSlash++;
            rows.add('www', path, sim.status, intended, [
                knownFailMarker(
                    'harness finding: mod_alias prefix append doubles the slash (slash-less from, slashed to)',
                    { status: sim.status, loc: intended },
                    sim
                ),
            ]);
        } else {
            counts.ok++;
            rows.add('www', path, sim.status, sim.loc);
        }
        return;
    }
    const own = apply(d, path);
    if (synthetic || typeof sim.by === 'string' || !own || collapseSlashes(own.loc) === collapseSlashes(sim.loc)) {
        // a mod_rewrite step answered first (slash hop, index.php, single-hop), or an earlier rule
        // answers identically: that IS the behaviour
        counts.ok++;
        rows.add('www', path, sim.status, sim.loc);
        return;
    }
    const sameEnd = finalOf(sim.loc) === finalOf(own.loc);
    counts.shadowed++;
    const how = sameEnd ? 'reaches the target in 2+ hops' : `ends on ${finalOf(sim.loc)}, not the target`;
    const intended = { status: own.status, loc: collapseSlashes(own.loc) };
    rows.add('www', path, intended.status, intended.loc, [
        knownFailMarker(`harness finding: shadowed by an earlier rule (${sim.by.text}) - ${how}`, intended, sim),
    ]);
}

// ---------------------------------------------------------------- rows
rows.section(base ? `grid-archive-redirects` : 'grid-redirects');
for (const d of alias) {
    if (d.kind === 'prefix') {
        rowFor(d.from, d);
        const last = d.from.slice(d.from.lastIndexOf('/') + 1);
        if (!d.from.endsWith('/') && !last.includes('.')) {
            // a directory-style page: its slashed form is the one links and crawlers use
            rowFor(`${d.from}/`, d);
        } else if (d.from.endsWith('/')) {
            rowFor(`${d.from}child/`, d, { synthetic: true });
        }
    } else {
        const sample = synthFromPattern(d.src);
        rowFor(sample, d);
        if (!sample.endsWith('/') && d.re.test(`${sample}/`)) {
            rowFor(`${sample}/`, d);
        }
    }
}

// SE-64 / SE-66: a single-hop rewrite lands on its final www URL in ONE 301, on www and apex - in an
// archive, on the archive's own copy of the target.
rows.section(base ? 'grid-archive-single-hop' : 'grid-single-hop');
for (const [from, to] of singleHop) {
    rows.add('www', `${base}${from}`, 301, to, ['hops=1']);
    rows.add('apex', `${base}${from}`, 301, to);
}

rows.section(base ? 'grid-archive-infra' : 'grid-infra');
// host canonicalisation keeps the path (and, in an archive, the archive prefix)
for (const p of [`${base}/javascript-data-grid/getting-started/`, `${base}/license-pricing/`]) {
    rows.add('apex', p, 301, `${SITE}${p}`);
}
rows.add('www', `${base}/index.php`, 301, `${base}/`);
rows.add('www', `${base}/documentation/index.php`, 301, `${base}/documentation/`);
// the trailing slash on the suffix keeps the slash rule out of the way, so the php-path rule fires
rows.add('www', `${base}/cookies.php/extra/`, 301, `${base}/cookies.php`);
rows.add('www', `${base}/license-pricing`, 301, `${base}/license-pricing/`);

// live pages that must not be swallowed by a broad rule
rows.section(base ? 'grid-archive-no-shadow' : 'grid-no-shadow');
for (const p of [
    '/angular-data-grid/getting-started/',
    '/react-data-grid/cell-editing/',
    '/javascript-data-grid/getting-started/',
    '/vue-data-grid/getting-started/',
    '/angular-data-grid/grid-api/',
    '/react-data-grid/aggregation-total-rows/',
    '/javascript-data-grid/integrated-charts/',
    '/react-data-grid/components/',
    '/angular-data-grid/filtering/',
    '/javascript-data-grid/cell-editing/',
    '/vue-data-grid/grid-options/',
    '/javascript-data-grid/aggregation/',
    '/angular-data-grid/component-cell-renderer/',
]) {
    if (!simulate(base + p)) {
        rows.add('www', base + p, 200);
    } else {
        console.error(
            `# no-shadow candidate ${base + p} is redirected by the rules: ${JSON.stringify(simulate(base + p))}`
        );
    }
}

process.stdout.write(
    rows.toString([
        `GENERATED by gen-main-expectations.mjs${base ? ` --base ${base}` : ''} - do not hand-edit; regenerate (see README).`,
        `rules: alias=${alias.length} single-hop=${singleHop.size}; rows=${rows.count} (${counts.doubleSlash} double-slash, ${counts.shadowed} shadowed: known-fail)`,
        `@min-rows ${Math.floor(rows.count * 0.95)}`,
    ])
);
console.error(`# ${file}${base ? ` (base ${base})` : ''}: ${rows.count} rows; ${JSON.stringify(counts)}`);
