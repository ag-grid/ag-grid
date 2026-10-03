#!/usr/bin/env node
// Set or clear the in-flight archive exemption in a deployed root .htaccess, in place, for grid
// and charts independently: either can have a release candidate without the other.
// Only the bytes between the BEGIN/END markers are rewritten; it exits non-zero otherwise.
//
//   node scripts/uncached-archives.mjs <htaccess>                          prints what is in flight
//   node scripts/uncached-archives.mjs <htaccess> set|clear <grid> <charts>
//
// <grid> and <charts> are versions such as 36.3.0 and 14.3.0, or '-' to leave that product alone
// (at least one must be a version). set replaces the named product's line and keeps the other's
// byte for byte. clear removes the named product's line only when that version is the one in
// flight: another version in flight is refused (exit 1, nothing changed); none in flight is
// already clear. Each product has at most one line, grid's first.
//
// ag-charts tools/archive/markChartsArchiveInFlight.mjs is a charts-only copy of this logic for the
// charts release job, which has no ag-grid checkout: any change to the markers or the rule text
// here must be made there too.
import { readFileSync, writeFileSync } from 'node:fs';

const BEGIN = '# BEGIN in-flight release archives - patched in place, do not edit by hand';
const END = '# END in-flight release archives';
const USAGE =
    'usage: node scripts/uncached-archives.mjs <htaccess> [set|clear <grid version|-> <charts version|->]\n' +
    '  e.g. set 36.3.0 14.3.0 (both), set - 14.3.0 (charts only), clear 36.3.0 - (grid only)';

const PRODUCTS = [
    { name: 'grid', prefix: '/archive/' },
    { name: 'charts', prefix: '/charts/archive/' },
];
const rule = (prefix, v) =>
    `Header set Cache-Control "no-cache" "expr=%{REQUEST_URI} =~ m#^${prefix}${v.replace(/\./g, '\\.')}/#"`;
// A whole line as rule() writes it for one product, capturing the version (dots escaped).
const linePattern = (prefix) =>
    new RegExp(
        `^Header set Cache-Control "no-cache" "expr=%\\{REQUEST_URI\\} =~ m#\\^${prefix}(\\d+\\\\\\.\\d+\\\\\\.\\d+)/#"$`
    );

const fail = (message, code = 2) => {
    console.error(message);
    process.exit(code);
};

const [file, action, ...versions] = process.argv.slice(2);
if (!file || (action && !['set', 'clear'].includes(action)) || (!action && versions.length)) {
    fail(USAGE);
}
const wanted = {};
if (action) {
    if (versions.length !== 2) {
        fail(`${action} needs a grid and a charts argument, either of which may be '-'.\n${USAGE}`);
    }
    for (const [i, { name }] of PRODUCTS.entries()) {
        if (versions[i] === '-') {
            continue;
        }
        if (!/^\d+\.\d+\.\d+$/.test(versions[i])) {
            fail(`'${versions[i]}' is not a ${name} version of the form 36.2.0, or '-'`);
        }
        wanted[name] = versions[i];
    }
    if (!Object.keys(wanted).length) {
        fail(`${action} needs at least one version.\n${USAGE}`);
    }
}

const source = readFileSync(file, 'utf8');
const b = source.indexOf(BEGIN);
const e = source.indexOf(END);
if (b < 0 || e < 0 || e < b || source.indexOf(BEGIN, b + 1) >= 0 || source.indexOf(END, e + 1) >= 0) {
    console.error(`No single in-flight marker block in ${file}.`);
    console.error('That file predates this feature, or is not the generated root .htaccess.');
    process.exit(1);
}

// The block's current lines, each kept verbatim, by product. Anything else in the block was not
// written by this tool or the generator, so it is refused rather than silently dropped.
const current = {};
for (const line of source
    .slice(b + BEGIN.length, e)
    .split('\n')
    .filter((l) => l.trim())) {
    const product = PRODUCTS.find(({ prefix }) => linePattern(prefix).test(line));
    if (!product || current[product.name]) {
        fail(`REFUSING: unexpected line in the in-flight block of ${file}:\n  ${line}`, 1);
    }
    current[product.name] = { line, version: line.match(linePattern(product.prefix))[1].replace(/\\/g, '') };
}
const show = (state) =>
    PRODUCTS.filter(({ name }) => state[name])
        .map(({ name }) => `${name} ${state[name].version}`)
        .join(', ') || 'nothing in flight';

if (!action) {
    console.log(show(current));
    process.exit(0);
}

const next = { ...current };
for (const [name, version] of Object.entries(wanted)) {
    const { prefix } = PRODUCTS.find((p) => p.name === name);
    if (action === 'set') {
        next[name] = current[name]?.version === version ? current[name] : { line: rule(prefix, version), version };
    } else if (current[name] && current[name].version !== version) {
        // Another cycle has moved this product on: ending it is not this caller's to do.
        fail(`REFUSING: ${name} ${current[name].version} is in flight, not ${version}. Nothing changed.`, 1);
    } else {
        delete next[name];
    }
}

const lines = PRODUCTS.filter(({ name }) => next[name]).map(({ name }) => next[name].line);
const head = source.slice(0, b + BEGIN.length);
const tail = source.slice(e);
const output = head + (lines.length ? '\n' + lines.join('\n') : '') + '\n' + tail;

if (output === source) {
    console.log(`already ${action}: ${show(current)}`);
    process.exit(0);
}
// output is built from source's own head and tail, so this guards the construction, not a diff.
if (!output.startsWith(head) || !output.endsWith(tail)) {
    fail('REFUSING: the change would touch bytes outside the marker block.', 1);
}

writeFileSync(file, output);
const named = Object.entries(wanted)
    .map(([name, version]) => `${name} ${version}`)
    .join(', ');
console.log(`${action === 'set' ? 'set' : 'cleared'} ${named} - now: ${show(next)}`);
