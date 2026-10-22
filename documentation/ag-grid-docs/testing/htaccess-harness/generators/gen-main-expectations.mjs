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
// The root file's alias hosts (the apex, the legacy framework subdomains, angulargrid.com) are
// modelled too, for the first hop only: the apex gets the single-hop rewrites, then every alias host
// gets the slash and the host swap together in one hop for a slash-less directory URL, or the host
// swap alone. A few rows per alias host prove that model on Apache; `firstHop` answers it for any
// request, which is how the production edge tests predict every redirect on every host.
//
// Usage: node gen-main-expectations.mjs <emitted .htaccess> [--base /archive/36.2.0]
// Or import mainExpectations(text, { base, label }).
import { readFileSync } from 'node:fs';

import {
    GeneratorError,
    Rows,
    SampleGaps,
    collapseSlashes,
    isMain,
    knownFailMarker,
    runCli,
    substitute,
    synthFromPattern,
    synthesises,
} from './lib.mjs';

const SITE = 'https://www.ag-grid.com';
const WWW = 'www.ag-grid.com';
const APEX = 'ag-grid.com';

// The slash-less rule names every alias host: `%{HTTP_HOST}:%{SERVER_PORT}` matches www on port 80
// (the scheme upgrade) or one of them on any port.
const ALIAS_HOSTS_COND =
    /^\s*RewriteCond %\{HTTP_HOST\}:%\{SERVER_PORT\} \^\(\?:www\\\.ag-grid\\\.com:80\|\(\?:([^)]+)\):\[0-9\]\+\)\$ \[NC\]$/;

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

/**
 * The grid .htaccess `text`, as expectation rows plus the model behind them.
 *
 * Returns `output` (the TSV), `summary` and `notes` (diagnostics), `hosts` (www first, then the alias
 * hosts; the root file only), `rules` (each redirect rule with its www samples: the expected answer,
 * and where Apache does something else, the `actual` one and the known-fail `marker`) and
 * `firstHop(host, path)`. Throws a GeneratorError when a rule gets no sample or a redirect catches a
 * protected live page.
 */
export function mainExpectations(text, { base = '', label = 'grid .htaccess' } = {}) {
    const lines = text.split('\n');
    const where = `${label}${base ? ` (base ${base})` : ''}`;

    // ------------------------------------------------------------ parse
    const singleHop = new Map(); // from -> to
    const alias = []; // { kind: 'prefix'|'regex', status, from|re, to, text }
    let aliasHosts = [];
    for (const line of lines) {
        let m;
        if ((m = line.match(/^\s*RewriteRule\s+"\^\/\?(.+?)\$"\s+"([^"]+)"\s+\[R=301(?:,NE)?,L\]/))) {
            // literal single-hop rewrites only (the per-dir pattern, so the same `from` in an archive)
            if (!/[()|[\]{}+*?]/.test(m[1])) {
                singleHop.set('/' + m[1].replace(/\\\./g, '.'), m[2]);
            }
        } else if ((m = line.match(/^\s*Redirect (301|410)\s+(\/\S*)(?:\s+(\S+))?\s*$/))) {
            // a path source only: `Redirect 301 "<url>"` inside an <If> has no source, just a target
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
        } else if (!aliasHosts.length && (m = line.match(ALIAS_HOSTS_COND))) {
            aliasHosts = m[1].split('|').map((h) => h.replace(/\\\./g, '.'));
        }
    }
    // An archive's own file has no host rules; the root's run for it, which this model does not cover.
    if (base) {
        aliasHosts = [];
    }

    // ------------------------------------------------------------ model
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

    /**
     * The first response for `path` on `host`: www as simulated, an alias host as the root file's
     * host rules answer it. Every alias-host answer is a 301 to www.
     */
    function firstHop(host, path) {
        if (host === WWW) {
            const sim = simulate(path);
            return sim ? { status: sim.status, location: sim.loc } : null;
        }
        if (!aliasHosts.includes(host)) {
            throw new Error(`${host} is not an alias host of ${where}`);
        }
        if (host === APEX && singleHop.has(path)) {
            return { status: 301, location: singleHop.get(path) };
        }
        if (/\/+[^.]+$/.test(path) && !path.endsWith('/') && !path.startsWith('/.well-known/')) {
            return { status: 301, location: `${SITE}${path}/` };
        }
        return { status: 301, location: `${SITE}${path}` };
    }

    const rows = new Rows();
    const gaps = new SampleGaps(where);
    const counts = { ok: 0, doubleSlash: 0, shadowed: 0 };
    const rules = [];

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
     * author had an intent for it, so its row records Apache's mechanics instead. Returns the sample,
     * marked `synthetic` when its path is made up (`madeUp`, a synthetic one included): no page is
     * expected at the end of its chain.
     */
    function rowFor(path, d, { synthetic = false, madeUp = synthetic } = {}) {
        const sample = sampleFor(path, d, synthetic);
        return madeUp ? { ...sample, synthetic: true } : sample;
    }

    function sampleFor(path, d, synthetic) {
        const sim = simulate(path);
        if (!sim) {
            // A sample is only made for a rule it matches, so this is a generator bug: dropping the row
            // would also lower @min-rows, losing the rule's coverage silently.
            throw new Error(`no rule matches generated sample ${path} (from: ${d.text})`);
        }
        const actual = { status: sim.status, location: sim.loc };
        if (sim.by === d) {
            const intended = collapseSlashes(sim.loc);
            if (intended !== sim.loc) {
                counts.doubleSlash++;
                const marker = knownFailMarker(
                    'harness finding: mod_alias prefix append doubles the slash (slash-less from, slashed to)',
                    { status: sim.status, loc: intended },
                    sim
                );
                rows.add('www', path, sim.status, intended, [marker]);
                return { path, status: sim.status, location: intended, actual, marker };
            }
            counts.ok++;
            rows.add('www', path, sim.status, sim.loc);
            return { path, ...actual };
        }
        const own = apply(d, path);
        if (synthetic || typeof sim.by === 'string' || !own || collapseSlashes(own.loc) === collapseSlashes(sim.loc)) {
            // a mod_rewrite step answered first (slash hop, index.php, single-hop), or an earlier rule
            // answers identically: that IS the behaviour
            counts.ok++;
            rows.add('www', path, sim.status, sim.loc);
            return { path, ...actual };
        }
        const sameEnd = finalOf(sim.loc) === finalOf(own.loc);
        counts.shadowed++;
        const how = sameEnd ? 'reaches the target in 2+ hops' : `ends on ${finalOf(sim.loc)}, not the target`;
        const intended = { status: own.status, loc: collapseSlashes(own.loc) };
        const marker = knownFailMarker(
            `harness finding: shadowed by an earlier rule (${sim.by.text}) - ${how}`,
            intended,
            sim
        );
        rows.add('www', path, intended.status, intended.loc, [marker]);
        return { path, status: intended.status, location: intended.loc, actual, marker };
    }

    // ------------------------------------------------------------ rows
    rows.section(base ? `grid-archive-redirects` : 'grid-redirects');
    for (const d of alias) {
        const samples = [];
        if (d.kind === 'prefix') {
            samples.push(rowFor(d.from, d));
            const last = d.from.slice(d.from.lastIndexOf('/') + 1);
            if (!d.from.endsWith('/') && !last.includes('.')) {
                // a directory-style page: its slashed form is the one links and crawlers use
                samples.push(rowFor(`${d.from}/`, d));
            } else if (d.from.endsWith('/')) {
                samples.push(rowFor(`${d.from}child/`, d, { synthetic: true }));
            }
        } else {
            const sample = synthFromPattern(d.src);
            if (!d.re.test(sample)) {
                gaps.add(d.text, (path) => d.re.test(path));
                continue;
            }
            const madeUp = synthesises(d.src);
            samples.push(rowFor(sample, d, { madeUp }));
            if (!sample.endsWith('/') && d.re.test(`${sample}/`)) {
                samples.push(rowFor(`${sample}/`, d, { madeUp }));
            }
        }
        rules.push({ rule: d.text, samples });
    }

    // SE-64 / SE-66: a single-hop rewrite lands on its final www URL in ONE 301, on www and apex - in an
    // archive, on the archive's own copy of the target.
    rows.section(base ? 'grid-archive-single-hop' : 'grid-single-hop');
    for (const [from, to] of singleHop) {
        // its own variant: an alias row for the same request (emitted above) must not swallow the hop check
        rows.add('www', `${base}${from}`, 301, to, ['hops=1'], 'single-hop');
        rows.add('apex', `${base}${from}`, 301, to);
        rules.push({
            rule: `single-hop ${from} -> ${to}`,
            samples: [{ path: `${base}${from}`, status: 301, location: to }],
        });
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
    const shadowedLive = [];
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
        const caught = simulate(base + p);
        if (caught) {
            // Dropping the 200 row here would hide exactly the regression this section exists to catch
            // (and lower @min-rows with it), so a caught live page stops the regeneration instead.
            shadowedLive.push(`${base + p} -> ${caught.status} ${caught.loc} by ${caught.by.text ?? caught.by}`);
        }
        rows.add('www', base + p, 200);
    }

    // The alias-host model, proved on Apache: on every alias host, one request for each way the root
    // file can answer it - a single-hop rewrite (the apex only), a slash-less directory URL, a slashed
    // one, and a file.
    if (aliasHosts.length) {
        rows.section('grid-alias-hosts');
        // not a single-hop source, whose apex answer is the single-hop probe's
        const firstFrom = (test) =>
            alias.find((d) => d.kind === 'prefix' && !singleHop.has(d.from) && test(d.from))?.from;
        const probes = [
            singleHop.keys().next().value,
            firstFrom((f) => !f.endsWith('/') && !f.slice(f.lastIndexOf('/')).includes('.')),
            firstFrom((f) => f.endsWith('/')),
            firstFrom((f) => f.slice(f.lastIndexOf('/')).includes('.')),
        ].filter(Boolean);
        for (const host of aliasHosts) {
            for (const path of probes) {
                const { status, location } = firstHop(host, path);
                rows.add(host === APEX ? 'apex' : host, path, status, location);
            }
        }
    }

    if (shadowedLive.length) {
        throw new GeneratorError([
            ...gaps.notes,
            `ERROR: ${where}: ${shadowedLive.length} protected live page(s) caught by a redirect:`,
            ...shadowedLive.map((s) => `  ${s}`),
        ]);
    }
    gaps.throwIfAny();

    return {
        output: rows.toString([
            `GENERATED by gen-main-expectations.mjs${base ? ` --base ${base}` : ''} - do not hand-edit; regenerate (see README).`,
            `rules: alias=${alias.length} single-hop=${singleHop.size}; rows=${rows.count} (${counts.doubleSlash} double-slash, ${counts.shadowed} shadowed: known-fail)`,
            `@min-rows ${rows.count}`,
        ]),
        summary: `# ${where}: ${rows.count} rows; ${JSON.stringify(counts)}`,
        notes: gaps.notes,
        hosts: aliasHosts.length ? [WWW, ...aliasHosts] : [WWW],
        rules,
        firstHop,
    };
}

if (isMain(import.meta.url)) {
    const args = process.argv.slice(2);
    const file = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--base');
    const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : '';
    if (!file) {
        console.error('usage: gen-main-expectations.mjs <emitted .htaccess> [--base /archive/<v>]');
        process.exit(2);
    }
    runCli(() => mainExpectations(readFileSync(file, 'utf8'), { base, label: file }));
}
