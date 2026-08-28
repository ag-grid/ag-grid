#!/usr/bin/env node
// Add or remove a version from UNCACHED_ARCHIVES in htaccessRules.ts.
//
// A release archive under test is redeployed for days and its fixes must be visible within
// minutes, so it is excluded from the caching that released archives get. Add the version
// when the archive is cut; remove it at GA. No archive rebuild either way — the rule lives
// in the root .htaccess.
//
//   node scripts/uncached-archives.mjs                 # show current
//   node scripts/uncached-archives.mjs add 36.2.0      # start of a release cycle
//   node scripts/uncached-archives.mjs remove 36.2.0   # at GA
//
// Then run the docs deploy. `./behave.sh --project ag-grid-docs htaccessRules -u` will need
// a snapshot update, since the generated .htaccess changes.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/utils/htaccess/htaccessRules.ts');
const DECL = /(export const UNCACHED_ARCHIVES: readonly string\[\] = )(\[[^\]]*\])(;)/;

const [action, version] = process.argv.slice(2);
const source = readFileSync(FILE, 'utf8');
const match = source.match(DECL);
if (!match) {
    console.error(`Could not find the UNCACHED_ARCHIVES declaration in ${FILE}`);
    process.exit(1);
}

const current = [...match[2].matchAll(/'([^']+)'/g)].map(([, v]) => v);
const show = (list) => (list.length ? list.join(', ') : '(none — all archives cached normally)');

if (!action) {
    console.log(`in flight: ${show(current)}`);
    process.exit(0);
}
if (!['add', 'remove'].includes(action) || !version) {
    console.error('usage: uncached-archives.mjs [add|remove] <version>');
    process.exit(2);
}
if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(`'${version}' is not a version of the form 36.2.0`);
    process.exit(2);
}

const next =
    action === 'add'
        ? [...new Set([...current, version])].sort()
        : current.filter((v) => v !== version);

if (next.length === current.length && action === 'add') {
    console.log(`${version} is already in flight — nothing to do.`);
    process.exit(0);
}
if (next.length === current.length) {
    console.log(`${version} was not in flight — nothing to do.`);
    process.exit(0);
}

const rendered = next.length ? `[${next.map((v) => `'${v}'`).join(', ')}]` : '[]';
writeFileSync(FILE, source.replace(DECL, `$1${rendered}$3`));

console.log(`   was: ${show(current)}`);
console.log(`   now: ${show(next)}`);
console.log(
    next.includes(version)
        ? `\n${version} will not be cached. Update the snapshot and deploy the docs.`
        : `\n${version} will now be cached like every other released archive. Update the snapshot and deploy the docs.`
);
