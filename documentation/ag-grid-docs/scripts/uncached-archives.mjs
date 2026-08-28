#!/usr/bin/env node
// Set or clear the release archive that is exempt from caching. Only one is ever in flight.
//
// An archive under test is redeployed for days and its fixes must appear within minutes, so
// it is excluded from the caching released archives get. No archive rebuild either way - the
// rule lives in the root .htaccess.
//
//   node scripts/uncached-archives.mjs set 36.2.0     # start of a release cycle
//   node scripts/uncached-archives.mjs clear          # at GA - clears whatever is set
//   node scripts/uncached-archives.mjs clear 36.2.0   # at GA - clears only if it is 36.2.0
//
// The guarded form is the safer one at GA: if a different version is in flight it refuses
// rather than clearing someone else's cycle.
//
// Then update the snapshot (./behave.sh --project ag-grid-docs htaccessRules -u) and deploy.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/utils/htaccess/htaccessRules.ts');
const DECL = /(export const UNCACHED_ARCHIVE: string \| null = )(.+?)(;)/;
const USAGE = 'usage: uncached-archives.mjs set <version> | clear [version]';

const [action, version] = process.argv.slice(2);

if (!['set', 'clear'].includes(action)) {
    console.error(USAGE);
    process.exit(2);
}
if (action === 'set' && !version) {
    console.error(`set needs a version.\n${USAGE}`);
    process.exit(2);
}
if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(`'${version}' is not a version of the form 36.2.0`);
    process.exit(2);
}

const source = readFileSync(FILE, 'utf8');
const match = source.match(DECL);
if (!match) {
    console.error(`Could not find the UNCACHED_ARCHIVE declaration in ${FILE}`);
    process.exit(1);
}
const current = match[2] === 'null' ? null : match[2].replace(/'/g, '');

if (action === 'clear' && !current) {
    console.log('Nothing is in flight; all archives cache normally.');
    process.exit(0);
}
// Guarded clear: refuse rather than clear a cycle that is not the one named.
if (action === 'clear' && version && current !== version) {
    console.error(`${current} is in flight, not ${version}. Refusing to clear.`);
    process.exit(1);
}

const next = action === 'set' ? `'${version}'` : 'null';
writeFileSync(FILE, source.replace(DECL, `$1${next}$3`));

console.log(`  was: ${current ?? 'null'}\n  now: ${action === 'set' ? version : 'null'}`);
console.log(
    action === 'set'
        ? `\n${version} will not be cached while it is in flight.`
        : `\n${current} will now be cached like every other released archive.`
);
