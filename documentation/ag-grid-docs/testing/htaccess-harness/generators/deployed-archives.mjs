#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI generator */
// Regenerate src/utils/htaccess/__fixtures__/deployed-archives/<site>-<version>.htaccess: the
// .htaccess each already-deployed archive was built with, emitted by that archive's own generator
// at the commit that built it, with its archive base. These are what scripts/migrate-archive-htaccess.mjs
// patches, so its tests and ./archive-migration.sh run on them.
//
// Each commit is the head of the release branch (b<version>) when the archive was built, taken from
// the Last-Modified of the archive's index.html on www (measured 2026-10-01). It is NOT always the
// release tag: grid 36.1.0, studio 2.1.2 and studio 3.0.0 were built from later branch commits, and
// grid 36.1.0's tag output disagrees with what is live. Every output here matched live on a sample of
// its redirects (status and Location), and on every redirect where the candidate commits differ.
//
// Only archives that ship their own .htaccess are listed (grid 36.0.0+, charts 14.0.0+, studio
// 2.0.0+); earlier ones keep the parent's rules and are not migrated. The *-top-level fixtures are
// the live /charts/ and /studio/ parents and are not generated here.
//
// Usage (from the repo root; the charts and studio clones are found as for run.sh, or set
// CHARTS_REPO / STUDIO_REPO):
//   node documentation/ag-grid-docs/testing/htaccess-harness/generators/deployed-archives.mjs [--check] [--out <dir>]
// --check compares instead of writing, and exits 1 on any difference.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { emitHtaccess, materialise, siblingCandidates } from '../lib/sources.mjs';

const GEN_DIR = fileURLToPath(new URL('.', import.meta.url));
const MAIN_REPO = resolve(GEN_DIR, '../../../../..');
const FIXTURES = resolve(GEN_DIR, '../../../src/utils/htaccess/__fixtures__/deployed-archives');
const WORK = process.env.REGEN_WORK || join(process.env.TMPDIR || '/tmp', 'ag-htaccess-deployed-archives');

// site, version, the commit that built it, and when (the archive's Last-Modified on www).
const DEPLOYED_ARCHIVES = [
    ['grid', '36.0.0', '38b867b09aeb12635c5fa6ac3af25de0f83224cd', '2026-06-24 11:00:42Z'],
    ['grid', '36.0.1', '1bc808020f1cadce0df21fa220e1dffa7a624719', '2026-07-15 10:13:59Z'],
    ['grid', '36.0.2', '407e09624ea2c37974209d4fca870857c9046171', '2026-07-21 16:21:03Z'],
    ['grid', '36.1.0', '0a62491fd5e47c7367ccdf8bf05bbda6f0d52516', '2026-09-01 14:39:34Z'],
    ['grid', '36.2.0', '071b5d59f07aaa67e15a30130546074a1690ba1d', '2026-09-15 15:36:15Z'],
    ['charts', '14.0.0', '03bf52b946c6223825a2f6ad18c804bf24e8c257', '2026-06-23 23:16:53Z'],
    ['charts', '14.0.1', 'fea785bcfb3112acd0f277cfda88d668617953f2', '2026-07-15 08:24:29Z'],
    ['charts', '14.0.2', '7e27553e432fc1614c7891d82ec874e54e7e1846', '2026-07-20 17:46:58Z'],
    ['charts', '14.1.0', '0f5c45f9faf83287d44536a21fda3b123d78ffff', '2026-08-05 13:14:28Z'],
    ['charts', '14.2.0', '2896e0c150e714e96e3cba358620b848f3439a8c', '2026-09-15 14:36:00Z'],
    ['studio', '2.0.0', '47c0e1e307cc2067f4b1d8b08cc4b4f2c28c3835', '2026-06-25 10:26:14Z'],
    ['studio', '2.0.1', '0955c0fef8f9eab9d68692a0930fa2ff79b455d8', '2026-06-30 19:52:29Z'],
    ['studio', '2.1.0', 'c711ba705539f5b6d20dc1c97315e11163e6a7fd', '2026-08-04 18:25:19Z'],
    ['studio', '2.1.1', '0c40f5127928a52ca42803f6769b2cb4e2dc3ebd', '2026-08-05 11:54:45Z'],
    ['studio', '2.1.2', 'd09aaa11cd98ad18e24d1ce39dc39a30f9077c0b', '2026-08-26 12:22:19Z'],
    ['studio', '3.0.0', '61eec96b24a8fb72c7e5c465783b1643872c9336', '2026-09-28 12:02:41Z'],
];

const baseOf = (site, version) => (site === 'grid' ? `/archive/${version}` : `/${site}/archive/${version}`);

function repoOf(site) {
    if (site === 'grid') {
        return MAIN_REPO;
    }
    const envVar = `${site.toUpperCase()}_REPO`;
    const names = site === 'charts' ? ['ag-charts', 'charts-clean'] : ['ag-studio', 'studio-clean'];
    const repo = process.env[envVar] ?? siblingCandidates(MAIN_REPO, names).find((p) => existsSync(join(p, '.git')));
    if (!repo || !existsSync(repo)) {
        throw new Error(`${site} repo not found (set ${envVar}=/path)`);
    }
    return repo;
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const outIndex = args.indexOf('--out');
const outDir = outIndex >= 0 ? resolve(args[outIndex + 1]) : FIXTURES;
mkdirSync(outDir, { recursive: true });

let differ = 0;
for (const [site, version, commit] of DEPLOYED_ARCHIVES) {
    const work = join(WORK, `${site}-${version}`);
    rmSync(work, { recursive: true, force: true });
    mkdirSync(work, { recursive: true });
    const src = materialise(site, repoOf(site), commit, work);
    const name = `${site}-${version}.htaccess`;
    const emitted = join(work, name);
    emitHtaccess(src.pkgDir, baseOf(site, version), emitted);
    const text = readFileSync(emitted, 'utf8');
    if (check) {
        const committed = existsSync(join(outDir, name)) ? readFileSync(join(outDir, name), 'utf8') : null;
        const same = committed === text;
        differ += same ? 0 : 1;
        console.log(`${same ? 'same   ' : 'DIFFERS'} ${name} (${src.label})`);
    } else {
        writeFileSync(join(outDir, name), text);
        console.log(`wrote ${name} (${text.split('\n').length} lines, ${src.label})`);
    }
}
rmSync(WORK, { recursive: true, force: true });
process.exit(differ ? 1 : 0);
