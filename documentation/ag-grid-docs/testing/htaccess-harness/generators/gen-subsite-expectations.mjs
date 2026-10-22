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
// apex and the blog host too (one hop to the same www target). The live file also gets a few rows on
// each of its other non-canonical hosts, which proves the host model that `firstHop` answers for any
// request: the production edge tests predict every redirect on every host with it.
//
// Usage: node gen-subsite-expectations.mjs <emitted .htaccess> --base /charts [--slug bar-series]
// Or import subsiteExpectations(text, { base, slug, label }).
import { readFileSync } from 'node:fs';

import {
    GeneratorError,
    Rows,
    SampleGaps,
    expandHosts,
    isMain,
    knownFailMarker,
    runCli,
    substitute,
    synthFromPattern,
    synthesises,
} from './lib.mjs';

const SITE = 'https://www.ag-grid.com';
const HOSTS = { www: 'www.ag-grid.com', apex: 'ag-grid.com', blog: 'blog.ag-grid.com' };

/**
 * The subsite .htaccess `text` deployed at `base`, as expectation rows plus the model behind them.
 *
 * Returns `output` (the TSV), `summary` and `notes` (diagnostics), `hosts` (www first, then every
 * non-canonical host), `rules` (each redirect rule with its www samples: the expected answer, and
 * where Apache does something else, the `actual` one and the known-fail `marker`) and
 * `firstHop(host, path)`. Throws a GeneratorError when the file has no redirect rules this models, or
 * a rule gets no sample.
 */
export function subsiteExpectations(text, { base, slug = 'sample', label = `${base} .htaccess` }) {
    const where = `${label} (base ${base})`;
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
        throw new GeneratorError([`ERROR: no RewriteRule redirects parsed from ${label}`]);
    }
    if (/^\s*Redirect(Match)?\s/m.test(text)) {
        throw new GeneratorError([
            `ERROR: ${label} has mod_alias Redirect lines; this generator only models RewriteRule redirects`,
        ]);
    }
    const nonCanonicalSource =
        text.match(/RewriteCond %\{HTTP_HOST\} (\^\(\?:ag-grid[^ ]+) \[NC\]/)?.[1] ?? '^(?:ag-grid\\.com)$';
    const NON_CANONICAL = new RegExp(nonCanonicalSource, 'i');
    const nonCanonicalHosts = expandHosts(nonCanonicalSource);

    /** The first response for `path` on `host`, or null when it is served as-is. */
    function simulate(path, host) {
        const rel = path.slice(base.length + 1);
        for (const r of rules) {
            const m = rel.match(r.re);
            if (m) {
                return { status: r.status, loc: r.status === 410 ? '' : substitute(r.to, m), by: r };
            }
        }
        const canonicalOrAlias = host === HOSTS.www || NON_CANONICAL.test(host);
        if (canonicalOrAlias && /\/+[^.]+$/.test(path) && !path.endsWith('/')) {
            return { status: 301, loc: `${SITE}${path}/`, by: 'slash' };
        }
        if (NON_CANONICAL.test(host)) {
            return { status: 301, loc: `${SITE}${path}`, by: 'host' };
        }
        return null;
    }

    function firstHop(host, path) {
        const sim = simulate(path, host);
        return sim ? { status: sim.status, location: sim.loc } : null;
    }

    const rows = new Rows();
    const gaps = new SampleGaps(where);
    let shadowed = 0;
    const cases = [];

    /**
     * One row for `path` on the `alias` host, asserting what `rule` intends. Returns the sample, marked
     * `synthetic` when `madeUp`: no page is expected at the end of its chain.
     */
    function rowFor(alias, path, rule, madeUp = false) {
        const sample = sampleFor(alias, path, rule);
        return madeUp ? { ...sample, synthetic: true } : sample;
    }

    function sampleFor(alias, path, rule) {
        const sim = simulate(path, HOSTS[alias]);
        if (!sim) {
            // A sample is only made for a rule it matches, so this is a generator bug: dropping the row
            // would also lower @min-rows, losing the rule's coverage silently.
            throw new Error(`sample ${path} matches no rule (${rule.text})`);
        }
        const actual = { status: sim.status, location: sim.loc };
        if (sim.by !== rule && typeof sim.by !== 'string') {
            const own = path.slice(base.length + 1).match(rule.re);
            const intended = { status: rule.status, loc: rule.status === 410 ? '' : substitute(rule.to, own) };
            const marker = knownFailMarker(
                `harness finding: shadowed by an earlier rule (${sim.by.text})`,
                intended,
                sim
            );
            if (marker) {
                shadowed++;
                rows.add(alias, path, intended.status, intended.loc, [marker]);
                return { path, status: intended.status, location: intended.loc, actual, marker };
            }
            // an earlier rule answers exactly as this one would: that IS the behaviour
        }
        rows.add(alias, path, sim.status, sim.loc);
        return { path, ...actual };
    }

    const area = base.includes('/archive/') ? `${base.split('/')[1]}-archive` : base.slice(1);
    rows.section(`${area}-redirects`);
    for (const r of rules) {
        const full = `${base}/${synthFromPattern(r.src, { slug }).replace(/^\//, '')}`;
        // the same sample without a trailing optional group, e.g. privacy for ^privacy(/.*)?$
        const minimalPattern = r.src.replace(/\((?:[^()]|\([^()]*\))*\)\?(\$?)$/, '$1');
        const minimal = `${base}/${synthFromPattern(minimalPattern, { slug }).replace(/^\//, '')}`;
        // each sample path, and whether it is made up (a wildcard filled in)
        const samples = new Map();
        for (const [s, pattern] of [
            [full, r.src],
            [minimal, minimalPattern],
        ]) {
            const noSlash = s.replace(/\/+$/, '');
            for (const form of [noSlash, `${noSlash}/`]) {
                if (r.re.test(form.slice(base.length + 1)) && !samples.has(form)) {
                    samples.set(form, synthesises(pattern));
                }
            }
        }
        if (!samples.size) {
            gaps.add(r.text, (path) => path.startsWith(`${base}/`) && r.re.test(path.slice(base.length + 1)));
            continue;
        }
        cases.push({ rule: r.text, samples: [...samples].map(([s, madeUp]) => rowFor('www', s, r, madeUp)) });
        const primary = [...samples.keys()][samples.size - 1];
        rowFor('apex', primary, r);
        rowFor('blog', primary, r);
    }

    // The host model, proved on Apache: on each other non-canonical host, a redirect rule's sample, a
    // slash-less directory URL and the subsite root. An archive keeps the rows it had.
    if (!base.includes('/archive/')) {
        rows.section(`${area}-alias-hosts`);
        const probes = [cases[0]?.samples.at(-1)?.path, `${base}/${slug}`, `${base}/`].filter(Boolean);
        for (const host of nonCanonicalHosts.filter((h) => h !== HOSTS.apex && h !== HOSTS.blog)) {
            for (const path of probes) {
                const { status, location } = firstHop(host, path);
                rows.add(host, path, status, location);
            }
        }
    }

    gaps.throwIfAny();

    return {
        output: rows.toString([
            `GENERATED by gen-subsite-expectations.mjs --base ${base} - do not hand-edit; regenerate (see README).`,
            `rules: ${rules.length} RewriteRule redirects; rows=${rows.count} (${shadowed} shadowed: known-fail)`,
            `@min-rows ${rows.count}`,
        ]),
        summary: `# ${where}: ${rules.length} rules, ${rows.count} rows, ${shadowed} shadowed`,
        notes: gaps.notes,
        hosts: [HOSTS.www, ...nonCanonicalHosts],
        rules: cases,
        firstHop,
    };
}

if (isMain(import.meta.url)) {
    const args = process.argv.slice(2);
    const opt = (name, dflt) => (args.includes(name) ? args[args.indexOf(name) + 1] : dflt);
    const file = args[0];
    const base = opt('--base');
    if (!file || !base) {
        console.error('usage: gen-subsite-expectations.mjs <emitted .htaccess> --base /charts [--slug bar-series]');
        process.exit(2);
    }
    runCli(() => subsiteExpectations(readFileSync(file, 'utf8'), { base, slug: opt('--slug', 'sample'), label: file }));
}
