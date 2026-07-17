#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI generator: writes rows to stdout / status to stderr */
// Generate behavioural expectation rows for the CHARTS /charts redirects, modelling the DOCROOT MIRROR.
//
// SE-66: the MAIN docroot .htaccess now MIRRORS the charts-subdir semantic redirects (see the
// "charts-subdir semantic redirects mirrored into the docroot" block in
// ../../src/utils/htaccess/htaccessRules.ts). That mirror runs BEFORE the apex->www host-swap and the
// generic "add trailing slash" rule, so every charts legacy URL resolves in a SINGLE 301 straight to
// its final www target, for BOTH slash forms (no-slash and trailing-slash). This generator therefore
// predicts, per charts rule, ONE hop to the final target for both slash forms.
//
// The ONE exception is /charts/privacy: it is intentionally NOT mirrored (its target is the apex
// /privacy page — see the note in htaccessRules.ts). For a non-mirrored rule we keep the two-layer
// prediction: the slash-less form takes the docroot trailing-slash hop first; the slashed form hits
// the charts mod_alias directly.
//
// Predictions are INDEPENDENT of the mirror's own regex — they are derived from the CHARTS rules'
// final targets. The harness then curls each row against real Apache running BOTH layers, so a
// mismatch between the charts rules (this repo's source of truth) and the hand-written docroot mirror
// (grid repo) surfaces as a failure — that cross-repo agreement is exactly what we want to guard.
//
// Usage: node gen-charts-expectations.mjs <charts_redirect_rules.txt> > charts_generated.tsv
import { readFileSync } from 'node:fs';

const rulesFile = process.argv[2];
if (!rulesFile) {
    console.error('usage: gen-charts-expectations.mjs <charts_redirect_rules.txt>');
    process.exit(2);
}
const lines = readFileSync(rulesFile, 'utf8').split('\n').filter(Boolean);

const SITE = 'https://www.ag-grid.com';

// The docroot mirror rewrites to an ABSOLUTE www URL with a canonical trailing slash — UNLESS the
// target carries a URL fragment (e.g. linear-gauge/#bullet-series), which is emitted verbatim.
function normalizeMirrorTarget(to) {
    let abs = to.startsWith('http') ? to : `${SITE}${to}`;
    if (!abs.includes('#') && !abs.endsWith('/')) {
        abs += '/';
    }
    return abs;
}

// The path portion of a target, to decide who owns it: the docroot mirror owns everything under
// /charts/; anything else (e.g. the apex /privacy page) stays with the charts subdir.
function targetPath(to) {
    return to.startsWith('http') ? to.replace(/^https?:\/\/[^/]+/, '') : to;
}
function isMirrored(to) {
    return targetPath(to).startsWith('/charts/');
}

// Both slash forms of a request path (no-slash first, then trailing-slash). A bare "/charts/" root
// collapses to just the slashed form.
function bothSlashForms(p) {
    const noSlash = p.replace(/\/+$/, '');
    const slashed = `${noSlash}/`;
    return noSlash === '' || noSlash === '/charts' ? [slashed] : [noSlash, slashed];
}

const rows = [];
const seenPaths = new Set();
const add = (path, status, loc = '', note = '') => {
    if (seenPaths.has(path)) {
        return; // first rule that matches a path wins in Apache; don't emit conflicting rows
    }
    seenPaths.add(path);
    rows.push({ path, status, loc, note });
};

// A mirrored rule: both slash forms of the request land on the final target in ONE hop.
function emitMirrored(reqForms, finalTarget, note) {
    const loc = normalizeMirrorTarget(finalTarget);
    for (const req of reqForms) {
        add(req, '301', loc, note);
    }
}

// A NOT-mirrored rule (only /charts/privacy today): charts-subdir behaviour. The slashed form hits
// mod_alias directly -> external target; the slash-less form first takes the docroot trailing-slash
// hop (its observed single response just adds the slash).
function emitNotMirrored(reqForms, finalTarget, note) {
    for (const req of reqForms) {
        if (req.endsWith('/')) {
            add(req, '301', finalTarget, `${note} (slashed -> subdir target)`);
        } else {
            add(req, '301', `${SITE}${req}/`, `${note} (no-slash -> trailing-slash hop first)`);
        }
    }
}

// Build a concrete request path that matches a given fromPattern. Realistic slugs from the docs corpus
// so the chosen page resolves on the live charts site.
const SLUG = 'bar-series'; // a real docs slug present for every framework

function concreteForPattern(pattern) {
    let p = pattern.replace(/^\^/, '');
    // Resolve framework alternations / char-classes to a concrete framework first.
    p = p.replace(/\((?:[a-z]+\|)+[a-z]+\)/g, (m) => m.slice(1, -1).split('|')[0]); // (a|b|c) -> a
    p = p.replace(/\[a-z\]\+/g, 'javascript'); // [a-z]+ -> javascript

    // Family-specific realistic completions (most specific first).
    if (p.startsWith('/charts/archive')) {
        return '/charts/archive/';
    }
    if (p.startsWith('/charts/privacy')) {
        return '/charts/privacy/';
    }
    if (p.startsWith('/charts/server-side-rendering')) {
        return '/charts/server-side-rendering/';
    }
    if (/\/charts\/javascript-charts\/(gallery|options)/.test(p)) {
        return p.includes('gallery') ? '/charts/javascript-charts/gallery/' : '/charts/javascript-charts/options/';
    }
    // {fw}-charts/{fw}/(.+|.*) -> a real legacy framework-docs page.
    let mm;
    if ((mm = p.match(/^\/charts\/([a-z]+)-charts\/([a-z]+)\/\(\.[+*]\)\$?$/))) {
        return `/charts/${mm[1]}-charts/${mm[2]}/${SLUG}/`;
    }
    // enterprise-charts.* / {fw}-charts.* catch-alls -> a real legacy page under that prefix.
    if ((mm = p.match(/^\/charts\/([a-z-]+-charts)\.[+*]\$?$/))) {
        return `/charts/${mm[1]}/license-pricing/`;
    }
    // enterprise-charts negative-lookahead catch-all: ^/charts/enterprise-charts/(?!index\.html$).+$
    if (p.startsWith('/charts/enterprise-charts/(?!')) {
        return '/charts/enterprise-charts/license-pricing/';
    }
    // core/(.*) and side/(.*) -> a real legacy framework-agnostic doc page.
    if ((mm = p.match(/^\/charts\/(core|side)\/\(\.[+*]\)\$?$/))) {
        return `/charts/${mm[1]}/${SLUG}/`;
    }
    // {fw}/series(/.*)? and {fw}/axes(/.*)? -> the bare aggregate index page.
    if ((mm = p.match(/^\/charts\/([a-z]+)\/(series|axes)\(\/\.\*\)\?\$?$/))) {
        return `/charts/${mm[1]}/${mm[2]}/`;
    }
    // Bare framework landing "/?$".
    p = p.replace(/\/\?\$$/, '/');
    // Generic fallbacks.
    p = p.replace(/\(\/\.\*\)\?\$?$/, '/');
    p = p.replace(/\(\.[+*]\)\$?$/, `${SLUG}/`);
    p = p.replace(/\.[+*]\$?$/, `${SLUG}/`);
    p = p.replace(/\$$/, '');
    return p;
}

// Resolve the concrete final target for a RedirectMatch given the concrete request path.
function targetFor(pattern, to, reqPath) {
    let re;
    try {
        re = new RegExp(pattern);
    } catch {
        return to;
    }
    const m = reqPath.match(re);
    if (!m) {
        return to; // shouldn't happen; fall back to literal target
    }
    return to.replace(/\$(\d)/g, (_, n) => m[Number(n)] ?? '');
}

for (const line of lines) {
    let mm;
    if ((mm = line.match(/^Redirect 301 (\S+) (\S+)$/))) {
        // mod_alias `Redirect` is a PREFIX match; `from` already carries the /charts base.
        const [, from, to] = mm;
        const forms = bothSlashForms(from);
        if (isMirrored(to)) {
            emitMirrored(forms, to, 'docroot mirror: single hop');
        } else {
            emitNotMirrored(forms, to, 'not mirrored (charts subdir)');
        }
    } else if ((mm = line.match(/^RedirectMatch 410 "([^"]+)"$/))) {
        const [, pattern] = mm;
        const req = concreteForPattern(pattern);
        for (const form of bothSlashForms(req)) {
            if (form.endsWith('/')) {
                add(form, '410', '', '410 (slashed form hits mod_alias)');
            } else {
                add(form, '301', `${SITE}${form}/`, '410 family: no-slash trailing-slash hop first');
            }
        }
    } else if ((mm = line.match(/^RedirectMatch 301 "([^"]+)" "([^"]+)"$/))) {
        const [, pattern, to] = mm;
        const req = concreteForPattern(pattern);
        const target = targetFor(pattern, to, req);
        const forms = bothSlashForms(req);
        if (isMirrored(to)) {
            emitMirrored(forms, target, `docroot mirror: single hop (pattern ${pattern})`);
        } else {
            emitNotMirrored(forms, target, `not mirrored (pattern ${pattern})`);
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
out.push('# host=www for all; charts legacy URLs are collapsed to a SINGLE hop by the docroot mirror');
out.push('# (grid repo htaccessRules.ts), except /charts/privacy which stays with the charts subdir.');
for (const r of rows) {
    out.push(`www\t${r.path}\t${r.status}\t${r.loc}`);
}
process.stdout.write(out.join('\n') + '\n');
console.error(`generated ${rows.length} rows from ${lines.length} rules`);
