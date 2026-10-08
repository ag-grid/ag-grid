#!/usr/bin/env node
/* eslint-disable no-console -- standalone CLI generator */
// Regenerate every expectations/generated-*.tsv from source, the same way the harness emits the
// .htaccess files it serves (same env vars: CHARTS_REPO/CHARTS_REF, STUDIO_REPO/STUDIO_REF,
// GRID_REF). All three sites are required here: a regeneration must never quietly drop a site.
//
// Regenerate only after an INTENTIONAL rule change, then review the diff like a snapshot update -
// regenerating to make a failure go away would re-predict the regression as the expectation.
//
// Usage (from the repo root):
//   CHARTS_REF=origin/<branch> STUDIO_REF=origin/<branch> node documentation/ag-grid-docs/testing/htaccess-harness/generators/regenerate.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LAYOUT, emitLayout, resolveSources, tsxEval } from '../lib/sources.mjs';

const GEN_DIR = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = resolve(GEN_DIR, '../expectations');
const MAIN_REPO = resolve(GEN_DIR, '../../../../..');
const WORK = process.env.REGEN_WORK || join(process.env.TMPDIR || '/tmp', 'ag-htaccess-regenerate');
const HTDOCS = join(WORK, 'htdocs');

rmSync(WORK, { recursive: true, force: true });
mkdirSync(HTDOCS, { recursive: true });

const env = { ...process.env, SKIP_CHARTS: '', SKIP_STUDIO: '' };
const resolved = resolveSources({ mainRepo: MAIN_REPO, work: WORK, htaccessEnv: 'production', env });
if (resolved.errors) {
    resolved.errors.forEach((e) => console.error(`ERROR: ${e}`));
    process.exit(1);
}
const { src } = resolved;
for (const [site, s] of Object.entries(src)) {
    console.error(`# ${site}: ${s.label}`);
}
emitLayout(src, HTDOCS);

const gen = (script, args) =>
    execFileSync('node', [join(GEN_DIR, script), ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const write = (name, content) => {
    writeFileSync(join(OUT_DIR, name), content);
    console.error(`# wrote expectations/${name}`);
};
const ht = (base) => join(HTDOCS, base, '.htaccess');

const gridArchive = `/archive/${LAYOUT.gridReleased}`;
const chartsArchive = `/charts/archive/${LAYOUT.chartsReleased}`;
const studioArchive = `/studio/archive/${LAYOUT.studioArchives[0]}`;

write('generated-grid.tsv', gen('gen-main-expectations.mjs', [ht('')]));
write('generated-grid-archive.tsv', gen('gen-main-expectations.mjs', [ht(gridArchive), '--base', gridArchive]));
write(
    'generated-charts.tsv',
    gen('gen-subsite-expectations.mjs', [ht('/charts'), '--base', '/charts', '--slug', 'bar-series'])
);
write(
    'generated-charts-archive.tsv',
    gen('gen-subsite-expectations.mjs', [ht(chartsArchive), '--base', chartsArchive, '--slug', 'bar-series'])
);
write(
    'generated-studio.tsv',
    gen('gen-subsite-expectations.mjs', [ht('/studio'), '--base', '/studio', '--slug', 'quick-start'])
);
write(
    'generated-studio-archive.tsv',
    gen('gen-subsite-expectations.mjs', [ht(studioArchive), '--base', studioArchive, '--slug', 'quick-start'])
);

// The markdown page registries, read from each site's source (patterns only).
const registry = (site, exportName) =>
    JSON.parse(
        tsxEval(
            src[site].pkgDir,
            `import('./src/utils/markdownPages.ts').then(m => { const mod = m.${exportName} ? m : m.default;
                process.stdout.write(JSON.stringify(mod.${exportName}.map(g => g.pattern).filter(Boolean))); })`,
            { PUBLIC_BASE_URL: site === 'grid' ? '' : `/${site}` }
        )
    );
const groups = {
    grid: registry('grid', 'GRID_MARKDOWN_PAGE_GROUPS'),
    charts: registry('charts', 'CHARTS_MARKDOWN_PAGE_GROUPS'),
    studio: registry('studio', 'STUDIO_MARKDOWN_PAGE_GROUPS'),
};
const config = [
    { category: 'grid-markdown-and-headers', base: '', kind: 'live', slug: 'getting-started', groups: groups.grid },
    {
        category: 'grid-archive-released',
        base: gridArchive,
        kind: 'released',
        slug: 'getting-started',
        groups: groups.grid,
    },
    {
        category: 'grid-archive-in-flight',
        base: `/archive/${LAYOUT.gridInFlight}`,
        kind: 'in-flight',
        slug: 'getting-started',
        groups: groups.grid,
    },
    {
        category: 'charts-markdown-and-headers',
        base: '/charts',
        kind: 'live',
        slug: 'bar-series',
        groups: groups.charts,
    },
    {
        category: 'charts-archive-released',
        base: chartsArchive,
        kind: 'released',
        slug: 'bar-series',
        groups: groups.charts,
    },
    {
        category: 'charts-archive-in-flight',
        base: `/charts/archive/${LAYOUT.chartsInFlight}`,
        kind: 'in-flight',
        slug: 'bar-series',
        groups: groups.charts,
    },
    {
        category: 'studio-markdown-and-headers',
        base: '/studio',
        kind: 'live',
        slug: 'quick-start',
        groups: groups.studio,
    },
    {
        category: 'studio-archive',
        base: studioArchive,
        kind: 'studio-archive',
        slug: 'quick-start',
        groups: groups.studio,
    },
];
const configFile = join(WORK, 'markdown-config.json');
writeFileSync(configFile, JSON.stringify(config, null, 2));
write('generated-markdown.tsv', gen('gen-markdown-expectations.mjs', [configFile]));
