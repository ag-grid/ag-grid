#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI generator: writes rows to stdout / status to stderr */
// gen-main-expectations.mjs
//
// Parse the emitted production .htaccess for the MAIN ag-grid-docs repo and synthesise
// behavioural-harness expectation rows for EVERY redirect rule, encoding the real Apache
// behaviours that the live httpd harness verifies:
//
//   * mod_alias is FIRST-match in config order (not longest-match).
//   * A parent mod_rewrite trailing-slash rule appends `/` to any no-trailing-slash, dot-less
//     path BEFORE mod_alias runs -> such a request's FIRST 301 just adds the slash. Dotted
//     paths (.php) are NOT slash-rewritten.
//   * The SE-* single-hop RewriteRules run BEFORE the trailing-slash rule and host-swap, so a
//     dot-less no-slash path that is itself a single-hop `from` jumps straight to its target.
//   * The https-upgrade RewriteRule only fires on :80; the local httpd listens on a high port,
//     so relative `Redirect` targets stay relative (Location keeps the localhost origin). The
//     host-swap only fires for `Host: ag-grid.com` (apex rows).
//
// Output: tab-separated rows `host \t path \t expect_status \t expect_location_substring`.
// We emit a PREDICTED expectation per row; the companion validate step curls each against real
// Apache and reconciles. Anything we cannot synthesise a path for is logged to stderr.
import { readFileSync } from 'node:fs';

const htaccessPath = process.argv[2];
if (!htaccessPath) {
    console.error('usage: gen-main-expectations.mjs <emitted .htaccess>');
    process.exit(2);
}
const lines = readFileSync(htaccessPath, 'utf8').split('\n');

const rows = []; // { host, path, status, loc, family, note }
const skipped = [];

const add = (host, path, status, loc, family, note = '') => rows.push({ host, path, status, loc, family, note });

// A path is slash-rewritten (trailing-slash hop fires first) when it has NO trailing slash AND
// its last segment contains no dot. Mirrors `RewriteCond %{REQUEST_URI} /+[^.]+$` + the rule
// `^(.+[^/])$` -> `%{REQUEST_URI}/`.
const isSlashRewritten = (p) => {
    if (p.endsWith('/')) {
        return false;
    }
    const lastSeg = p.slice(p.lastIndexOf('/') + 1);
    return lastSeg.length > 0 && !lastSeg.includes('.');
};

// Collect the SE-* single-hop rewrite `from` -> `to` pairs. These RewriteRules run BEFORE the
// trailing-slash rule and the host-swap, so the path jumps straight to its absolute www target in
// ONE hop on EITHER host (www or apex) — that single-hop-regardless-of-host property is SE-66.
const singleHopFroms = new Set();
const singleHopPairs = []; // { from, to }
const reRewrite = /^\s*RewriteRule\s+"\^\/\?(.+?)\$"\s+"([^"]+)"\s+\[R=301,L\]/;
for (const line of lines) {
    const m = line.match(reRewrite);
    if (m) {
        // unescape the \. that the generator inserts
        const from = '/' + m[1].replace(/\\\./g, '.');
        singleHopFroms.add(from);
        singleHopPairs.push({ from, to: m[2] });
    }
}

// --- Parse rules in config order ---
const reRedirect301 = /^\s*Redirect 301\s+(\S+)\s+(\S+)\s*$/;
const reRedirect410 = /^\s*Redirect 410\s+(\S+)\s*$/;
const reRMatch = /^\s*RedirectMatch\s+(301|410|302)\s+"?([^"\s]+)"?\s*(?:"?([^"\s]+)"?)?\s*$/;

let nRedirect301 = 0,
    nRedirect410 = 0,
    nRMatch = 0,
    nRewrite = singleHopFroms.size;

// Helper: for a relative target, the Location substring on localhost is the target path itself.
// For an absolute https://www.ag-grid.com target, Location contains that absolute URL.
const locFor = (to) => to; // substring match works for both relative and absolute

// ---- Redirect 301 (prefix match in mod_alias) ----
for (const line of lines) {
    const m = line.match(reRedirect301);
    if (!m) {
        continue;
    }
    nRedirect301++;
    const from = m[1];
    const to = m[2];

    // Skip the SE single-hop entries duplicated as Redirect? They are RewriteRules, not Redirect,
    // so they won't appear here. Good.

    // Variant A: request the `from` exactly.
    if (isSlashRewritten(from)) {
        // dot-less, no-slash: trailing-slash hop fires first UNLESS it's a single-hop `from`.
        if (singleHopFroms.has(from)) {
            add('www', from, '301', locFor(to), 'redirect301-singlehop', 'single-hop rewrite pre-empts');
        } else {
            add('www', from, '301', from + '/', 'redirect301-slashhop', 'trailing-slash hop first');
            // and the slashed form resolves to the real target
            add('www', from + '/', '301', locFor(to), 'redirect301', 'slashed form -> target');
        }
    } else {
        // has trailing slash or a dot -> mod_alias matches directly.
        add('www', from, '301', locFor(to), 'redirect301', '');
    }

    // Variant B: a child segment under a directory-style `from` (ends with `/`). mod_alias is a
    // PREFIX match, so `/from/child` -> `to` + `child` (target gets the remainder appended).
    if (from.endsWith('/')) {
        const childReq = from + 'child';
        // child has no dot and no trailing slash -> trailing-slash hop fires first.
        add('www', childReq, '301', childReq + '/', 'redirect301-child-slashhop', 'child: trailing-slash hop first');
        // slashed child resolves: mod_alias appends remainder to target.
        const childSlashed = from + 'child/';
        const childTarget = to.endsWith('/') ? to + 'child/' : to + '/child/';
        add('www', childSlashed, '301', childTarget, 'redirect301-child', 'prefix match appends remainder');
    }
}

// ---- Redirect 410 (prefix) ----
for (const line of lines) {
    const m = line.match(reRedirect410);
    if (!m) {
        continue;
    }
    // guard: don't double-count the "Redirect 301" lines (regex is anchored to 410 so fine)
    nRedirect410++;
    const from = m[1];
    if (isSlashRewritten(from)) {
        add('www', from, '301', from + '/', 'redirect410-slashhop', 'trailing-slash hop first');
        add('www', from + '/', '410', '', 'redirect410', 'slashed form -> 410');
    } else {
        add('www', from, '410', '', 'redirect410', '');
    }
}

// ---- RedirectMatch (regex) ----
// We synthesise a sample path from the pattern and predict the target. Because mod_alias appends
// the unmatched URL remainder for RedirectMatch, we keep predictions conservative: assert the
// status + that Location CONTAINS the rule's target stem. Validation reconciles exact values.
for (const line of lines) {
    const m = line.match(reRMatch);
    if (!m) {
        continue;
    }
    const status = m[1];
    let pat = m[2];
    const to = m[3] || '';
    nRMatch++;

    // Build a concrete matching sample from the regex pattern.
    const sample = synthFromPattern(pat);
    if (sample == null) {
        skipped.push(`RedirectMatch ${status} ${pat} -> ${to} (could not synthesise path)`);
        continue;
    }

    // backref substitution for the target stem (best-effort; validation confirms exact)
    let predictedLoc = to;
    if (to.includes('$1') || to.includes('$2')) {
        predictedLoc = substituteBackrefs(pat, sample, to);
    }
    // Family label from pattern
    const family = 'redirectmatch-' + status;

    if (status === '410') {
        // sample may be slash-rewritten first
        if (isSlashRewritten(sample)) {
            add('www', sample, '301', sample + '/', family + '-slashhop', `pattern ${pat}`);
            add('www', sample + '/', '410', '', family, `pattern ${pat}`);
        } else {
            add('www', sample, '410', '', family, `pattern ${pat}`);
        }
        continue;
    }
    if (status === '302') {
        add('www', sample, '302', predictedLoc, family, `pattern ${pat}`);
        continue;
    }
    // 301: if sample is dot-less no-slash and would be slash-rewritten, the trailing-slash hop
    // fires first. To assert the actual redirect target cleanly, prefer a slashed sample where
    // the pattern allows it.
    if (isSlashRewritten(sample)) {
        const slashed = sample + '/';
        if (new RegExp(pat).test(slashed)) {
            // use slashed sample so mod_alias fires (still need to re-predict backrefs)
            let loc2 = to;
            if (to.includes('$1') || to.includes('$2')) {
                loc2 = substituteBackrefs(pat, slashed, to);
            }
            add('www', slashed, '301', loc2, family, `pattern ${pat} (slashed sample)`);
            // also record the no-slash -> slash hop to guard that nuance
            add('www', sample, '301', sample + '/', family + '-slashhop', `pattern ${pat}`);
        } else {
            // pattern only matches the no-slash form; trailing-slash hop would break it, so the
            // redirect must out-rank the trailing-slash rule (it runs later) -> expect target.
            // mod_rewrite trailing-slash has [L]; mod_alias runs in a later phase only if no
            // mod_rewrite rule matched. Validation will tell us; predict target.
            add('www', sample, '301', predictedLoc, family, `pattern ${pat} (no-slash only)`);
        }
    } else {
        add('www', sample, '301', predictedLoc, family, `pattern ${pat}`);
    }
}

// Synthesise a concrete path that matches a (simple, anchored) Apache regex pattern.
function synthFromPattern(pat) {
    let p = pat;
    const anchoredStart = p.startsWith('^');
    if (anchoredStart) {
        p = p.slice(1);
    }
    if (p.endsWith('$')) {
        p = p.slice(0, -1);
    }

    // If not anchored at start (e.g. "/archive$"), prefix something realistic.
    let prefix = anchoredStart ? '' : '/documentation';

    // Walk the pattern producing a literal sample.
    let out = '';
    let i = 0;
    while (i < p.length) {
        const c = p[i];
        if (c === '\\') {
            // escaped literal
            out += p[i + 1];
            i += 2;
            continue;
        }
        if (c === '(') {
            // find matching close paren (no nested groups in these patterns)
            let depth = 1;
            let j = i + 1;
            while (j < p.length && depth > 0) {
                if (p[j] === '\\') {
                    j += 2;
                    continue;
                }
                if (p[j] === '(') {
                    depth++;
                }
                if (p[j] === ')') {
                    depth--;
                }
                j++;
            }
            const inner = p.slice(i + 1, j - 1); // content of group
            let rest = p.slice(j); // remainder after group
            const quant = rest[0]; // ? * + or undefined
            // Choose an alternative within the group (first alt before any top-level |)
            let alt = inner;
            const bar = topLevelBar(inner);
            if (bar >= 0) {
                alt = inner.slice(0, bar);
            }
            // Expand the chosen alt as a sub-pattern.
            let altSample = synthInner(alt);
            // Apply quantifier: ? -> include once; * -> include once (to exercise remainder); + -> once.
            // For a trailing optional group like (/.*)? choose to include a child so we exercise the
            // append behaviour where relevant; but for a clean target assertion, include minimal.
            if (quant === '?') {
                // include the group once (covers the "with suffix" case)
                out += altSample;
                i = j + 1;
                continue;
            }
            out += altSample;
            i = j;
            continue;
        }
        if (c === '.') {
            // ".*" or ".+" or "."
            const next = p[i + 1];
            if (next === '*') {
                out += 'sample';
                i += 2;
                continue;
            }
            if (next === '+') {
                out += 'sample';
                i += 2;
                continue;
            }
            out += 'x';
            i += 1;
            continue;
        }
        if (c === '[') {
            // char class: pick a letter; skip to ]
            let j = i + 1;
            while (j < p.length && p[j] !== ']') {
                j++;
            }
            out += 'a';
            i = j + 1;
            // possible quantifier
            if (p[i] === '+' || p[i] === '*') {
                i++;
            }
            continue;
        }
        // plain literal
        out += c;
        i++;
    }
    let result = prefix + out;
    // normalise: ensure starts with /
    if (!result.startsWith('/')) {
        result = '/' + result;
    }
    return result;
}

// expand an inner alternative (may contain /.* etc.)
function synthInner(s) {
    let out = '';
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (c === '\\') {
            out += s[i + 1];
            i += 2;
            continue;
        }
        if (c === '.') {
            const next = s[i + 1];
            if (next === '*' || next === '+') {
                out += 'sample';
                i += 2;
                continue;
            }
            out += 'x';
            i++;
            continue;
        }
        if (c === '[') {
            let j = i + 1;
            while (j < s.length && s[j] !== ']') {
                j++;
            }
            out += 'a';
            i = j + 1;
            if (s[i] === '+' || s[i] === '*') {
                i++;
            }
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

function topLevelBar(inner) {
    let depth = 0;
    for (let i = 0; i < inner.length; i++) {
        if (inner[i] === '\\') {
            i++;
            continue;
        }
        if (inner[i] === '(') {
            depth++;
        } else if (inner[i] === ')') {
            depth--;
        } else if (inner[i] === '|' && depth === 0) {
            return i;
        }
    }
    return -1;
}

// Substitute $1/$2 in target using the synthesised sample run through the pattern.
function substituteBackrefs(pat, sample, to) {
    try {
        const re = new RegExp(pat);
        const mm = sample.match(re);
        if (!mm) {
            return to;
        }
        return to.replace(/\$(\d)/g, (_, d) => mm[Number(d)] ?? '');
    } catch {
        return to;
    }
}

// ---- SE-* single-hop rewrites (RewriteRule, run before trailing-slash + host-swap) ----
// www: lands on the absolute www target in ONE hop. apex (Host: ag-grid.com): SAME single hop,
// because the rewrite fires before the non-www->www host-swap (SE-66 proof).
for (const { from, to } of singleHopPairs) {
    add('www', from, '301', to, 'single-hop-rewrite', 'RewriteRule before trailing-slash');
    add('apex', from, '301', to, 'single-hop-rewrite-apex', 'SE-66: one hop on apex too');
}

// ---- Infra RewriteRules (host-swap, https-upgrade-context, index.php, php-path, trailing-slash) ----
// apex host-swap: a plain path on Host: ag-grid.com takes ONE hop to the www origin (the path is
// preserved; this proves the non-www->www rule, separate from the SE single-hops).
infraRows();
function infraRows() {
    // host-swap on a path with no single-hop override -> www origin, path preserved
    add(
        'apex',
        '/javascript-data-grid/getting-started/',
        '301',
        'https://www.ag-grid.com/javascript-data-grid/getting-started/',
        'infra-host-swap',
        'non-www -> www, path preserved'
    );
    add(
        'apex',
        '/license-pricing/',
        '301',
        'https://www.ag-grid.com/license-pricing/',
        'infra-host-swap',
        'non-www -> www'
    );
    // index.php removal
    add('www', '/index.php', '301', '/', 'infra-index-php', 'strip index.php');
    add(
        'www',
        '/documentation/index.php',
        '301',
        '/documentation/',
        'infra-index-php-path',
        'strip trailing index.php'
    );
    // php path-suffix stripping: /foo.php/bar/ -> /foo.php. The trailing slash on the suffix means
    // the trailing-slash rule does NOT pre-empt (the path already ends in /), so the php-path-strip
    // rule actually fires (a bare /cookies.php/extra would first take a harmless trailing-slash hop).
    add('www', '/cookies.php/extra/', '301', '/cookies.php', 'infra-php-path', 'strip path after .php');
    // trailing-slash add for a dotless no-slash path that is NOT otherwise redirected
    add('www', '/license-pricing', '301', '/license-pricing/', 'infra-trailing-slash', 'add trailing slash');
}

// --- No-shadow rows: real live pages that must stay 200 and must NOT be caught by broad regexes.
const noShadow = [
    // real *-data-grid pages must NOT be swallowed by the broad /{fw}-grid/ prefix rules nor by
    // the SE single-hop overrides nor the broad charts RedirectMatch catch-alls.
    '/angular-data-grid/getting-started/',
    '/react-data-grid/cell-editing/',
    '/javascript-data-grid/getting-started/',
    '/vue-data-grid/getting-started/',
    '/angular-data-grid/grid-api/',
    '/react-data-grid/aggregation-total-rows/',
    '/javascript-data-grid/integrated-charts/',
    '/charts/react/bar-series/',
    // pages whose first path segment is react/angular/vue/javascript-like but are NOT the charts
    // catch-all (those patterns are ^/react/... with a slash, distinct from /react-data-grid/...).
    '/react-data-grid/components/',
    '/angular-data-grid/filtering/',
    '/javascript-data-grid/cell-editing/',
    '/vue-data-grid/grid-options/',
    // a deep grid page that shares a stem with a redirect target family
    '/javascript-data-grid/aggregation/',
    '/angular-data-grid/component-cell-renderer/',
];
for (const p of noShadow) {
    add('www', p, '200', '', 'no-shadow', 'live page must stay 200');
}

// Explicit nuance: the bare dot-less no-slash /forum (matched by RedirectMatch 410 ^/forum(/|$))
// first takes the harmless trailing-slash hop, THEN /forum/ 410s. Guards both halves.
add('www', '/forum', '301', '/forum/', 'redirectmatch-410-slashhop', 'no-slash -> slash hop before 410');

// --- Emit ---
const header = [
    '# host\tpath\texpect_status\texpect_location_substring',
    '# GENERATED by gen-main-expectations.mjs from the emitted production .htaccess.',
    '# host: "www" (default) or "apex" (Host: ag-grid.com). Assertions are on the SINGLE response.',
    '#',
    `# rules: Redirect301=${nRedirect301} Redirect410=${nRedirect410} RedirectMatch=${nRMatch} single-hop-rewrites=${nRewrite}`,
    '#',
].join('\n');

const body = rows.map((r) => `${r.host}\t${r.path}\t${r.status}\t${r.loc}`).join('\n');
process.stdout.write(header + '\n' + body + '\n');

console.error(
    `# Parsed: Redirect301=${nRedirect301} Redirect410=${nRedirect410} RedirectMatch=${nRMatch} singleHop=${nRewrite}`
);
console.error(`# Emitted ${rows.length} candidate rows.`);
if (skipped.length) {
    console.error(`# SKIPPED ${skipped.length}:`);
    for (const s of skipped) {
        console.error('#   ' + s);
    }
}
