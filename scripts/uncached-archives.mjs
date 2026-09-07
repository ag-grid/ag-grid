#!/usr/bin/env node
// Set or clear the in-flight archive exemption in a deployed root .htaccess, in place.
// Only the bytes between the BEGIN/END markers are rewritten; it exits non-zero otherwise.
// set overwrites; clear only clears when both supplied versions match what is in flight.
import { readFileSync, writeFileSync } from 'node:fs';

const BEGIN = '# BEGIN in-flight release archives - patched in place, do not edit by hand';
const END = '# END in-flight release archives';
const USAGE = 'usage: node scripts/uncached-archives.mjs <htaccess> [set|clear <grid> <charts>]';

const [file, action, grid, charts] = process.argv.slice(2);

if (!file) {
    console.error(USAGE);
    process.exit(2);
}
if (action && !['set', 'clear'].includes(action)) {
    console.error(USAGE);
    process.exit(2);
}
if (action && (!grid || !charts)) {
    console.error(`${action} needs both a grid and a charts version.\n${USAGE}`);
    process.exit(2);
}
for (const v of [grid, charts].filter(Boolean)) {
    if (!/^\d+\.\d+\.\d+$/.test(v)) {
        console.error(`'${v}' is not a version of the form 36.2.0`);
        process.exit(2);
    }
}

const source = readFileSync(file, 'utf8');
const b = source.indexOf(BEGIN);
const e = source.indexOf(END);
if (b < 0 || e < 0 || e < b) {
    console.error(`No in-flight marker block in ${file}.`);
    console.error('That file predates this feature, or is not the generated root .htaccess.');
    process.exit(1);
}

const GRID_PREFIX = '/archive/';
const CHARTS_PREFIX = '/charts/archive/';
const rule = (prefix, v) =>
    `Header set Cache-Control "no-cache" "expr=%{REQUEST_URI} =~ m#^${prefix}${v.replace(/\./g, '\\.')}/#"`;

const before = source
    .slice(b + BEGIN.length, e)
    .trim()
    .split('\n')
    .filter(Boolean);

// Read back the versions currently in the block, so clear can be guarded on them.
const versionIn = (prefix) => {
    const line = before.find((l) => l.includes(`m#^${prefix}`));
    const m = line?.match(new RegExp(`m#\\^${prefix.replace(/\//g, '\\/')}([0-9\\\\.]+)\\/#`));
    return m ? m[1].replace(/\\/g, '') : null;
};
const current = { grid: versionIn(GRID_PREFIX), charts: versionIn(CHARTS_PREFIX) };
const show = (g, c) => (g || c ? `grid ${g ?? 'none'}, charts ${c ?? 'none'}` : 'nothing in flight');

if (!action) {
    console.log(show(current.grid, current.charts));
    process.exit(0);
}

// clear is a no-op, not a failure, when there is nothing of ours to clear. It runs from a
// release step that must not fail the build for finding the block already in the state it
// wants - and a cycle that has moved on to other versions is not this step's to end.
if (action === 'clear' && (current.grid !== grid || current.charts !== charts)) {
    if (!current.grid && !current.charts) {
        console.log('nothing in flight - nothing to clear');
    } else {
        console.log(
            `left alone: ${show(current.grid, current.charts)} is in flight, not grid ${grid}, charts ${charts}`
        );
    }
    process.exit(0);
}

const after = action === 'set' ? [rule(GRID_PREFIX, grid), rule(CHARTS_PREFIX, charts)] : [];

const head = source.slice(0, b + BEGIN.length);
const tail = source.slice(e);
const next = head + (after.length ? '\n' + after.join('\n') : '') + '\n' + tail;

if (next === source) {
    console.log(`already ${action === 'set' ? `set: grid ${grid}, charts ${charts}` : 'clear'}`);
    process.exit(0);
}
// next is built from source's own head and tail, so this guards the construction, not a diff.
if (!next.startsWith(head) || !next.endsWith(tail)) {
    console.error('REFUSING: the change would touch bytes outside the marker block.');
    process.exit(1);
}

writeFileSync(file, next);
console.log(action === 'set' ? `set grid ${grid}, charts ${charts}` : `cleared grid ${grid}, charts ${charts}`);
