#!/usr/bin/env node
// Set or clear the release archive that is exempt from caching. Only one is ever in flight.
//
// An archive under test is redeployed for days and its fixes must appear within minutes, so
// it is excluded from the caching released archives get. No archive rebuild either way - the
// rule lives in the root .htaccess.
//
//   node scripts/uncached-archives.mjs 36.2.0   # start of a release cycle
//   node scripts/uncached-archives.mjs          # at GA - clears it
//
// Then update the snapshot (./behave.sh --project ag-grid-docs htaccessRules -u) and deploy.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../src/utils/htaccess/htaccessRules.ts');
const DECL = /(export const UNCACHED_ARCHIVE: string \| null = )(.+?)(;)/;

const version = process.argv[2];
if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
    console.error(`'${version}' is not a version of the form 36.2.0`);
    process.exit(2);
}

const source = readFileSync(FILE, 'utf8');
if (!DECL.test(source)) {
    console.error(`Could not find the UNCACHED_ARCHIVE declaration in ${FILE}`);
    process.exit(1);
}

const was = source.match(DECL)[2];
const now = version ? `'${version}'` : 'null';
writeFileSync(FILE, source.replace(DECL, `$1${now}$3`));

console.log(`  was: ${was}\n  now: ${now}`);
console.log(
    version
        ? `\n${version} will not be cached while it is in flight.`
        : `\nNo archive is in flight; all archives cache normally again.`
);
