#!/usr/bin/env node
// Set or clear the release archives that are exempt from caching.
//
// Grid and Charts ship together at their own version numbers (Grid 36.x, Charts 14.x), so both
// are named. An archive under test is redeployed for days and its fixes must appear within
// minutes, so it is excluded from the caching released archives get. No archive rebuild either
// way - the rule lives in the root .htaccess.
//
// Studio archives are never cached, so they need no entry here.
//
//   node scripts/uncached-archives.mjs set 36.2.0 14.3.0   # start of a release cycle
//   node scripts/uncached-archives.mjs clear               # at GA
//   node scripts/uncached-archives.mjs clear 36.2.0 14.3.0 # at GA - only if those are set
//
// The guarded form is the safer one at GA: if different versions are in flight it refuses
// rather than ending someone else's cycle.
//
// Then update the snapshot (./behave.sh --project ag-grid-docs htaccessRules -u) and deploy.
// On b36.1.0 and older the project filter is --project all.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(
    dirname(fileURLToPath(import.meta.url)),
    '../documentation/ag-grid-docs/src/utils/htaccess/htaccessRules.ts'
);
const DECL = (name) => new RegExp(`(export const ${name}: string \\| null = )(.+?)(;)`);
const GRID = 'UNCACHED_GRID_ARCHIVE';
const CHARTS = 'UNCACHED_CHARTS_ARCHIVE';
const USAGE = 'usage: node scripts/uncached-archives.mjs set <grid> <charts> | clear [grid charts]';

const [action, grid, charts] = process.argv.slice(2);

if (!['set', 'clear'].includes(action)) {
    console.error(USAGE);
    process.exit(2);
}
if (action === 'set' && (!grid || !charts)) {
    console.error(`set needs both a grid and a charts version.\n${USAGE}`);
    process.exit(2);
}
if (action === 'clear' && Boolean(grid) !== Boolean(charts)) {
    console.error(`a guarded clear needs both versions, or neither.\n${USAGE}`);
    process.exit(2);
}
for (const v of [grid, charts].filter(Boolean)) {
    if (!/^\d+\.\d+\.\d+$/.test(v)) {
        console.error(`'${v}' is not a version of the form 36.2.0`);
        process.exit(2);
    }
}

const source = readFileSync(FILE, 'utf8');
const read = (name) => {
    const m = source.match(DECL(name));
    if (!m) {
        console.error(`Could not find the ${name} declaration in ${FILE}`);
        process.exit(1);
    }
    return m[2] === 'null' ? null : m[2].replace(/'/g, '');
};
const current = { grid: read(GRID), charts: read(CHARTS) };
const show = (g, c) => (g || c ? `grid ${g ?? 'null'}, charts ${c ?? 'null'}` : 'nothing in flight');

if (action === 'clear' && !current.grid && !current.charts) {
    console.log('Nothing is in flight; released archives cache normally.');
    process.exit(0);
}
// Guarded clear: refuse rather than clear a cycle that is not the one named.
if (action === 'clear' && grid && (current.grid !== grid || current.charts !== charts)) {
    console.error(
        `${show(current.grid, current.charts)} is in flight, not grid ${grid}, charts ${charts}. Refusing to clear.`
    );
    process.exit(1);
}

const next = action === 'set' ? { grid, charts } : { grid: null, charts: null };
const rendered = (v) => (v ? `'${v}'` : 'null');
writeFileSync(
    FILE,
    source.replace(DECL(GRID), `$1${rendered(next.grid)}$3`).replace(DECL(CHARTS), `$1${rendered(next.charts)}$3`)
);

console.log(`  was: ${show(current.grid, current.charts)}\n  now: ${show(next.grid, next.charts)}`);
console.log(
    action === 'set'
        ? `\nGrid ${grid} and Charts ${charts} will not be cached while in flight.`
        : `\nThose archives will now be cached like every other released archive.`
);
