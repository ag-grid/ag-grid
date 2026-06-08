#!/usr/bin/env node
/**
 * Generates .astro/cache/sitemap-lastmod.json — a map of source-file paths
 * (relative to the website package root) to their git last-modified dates.
 *
 * Run from the website package directory (e.g. packages/ag-charts-website/).
 * Requires a full git history (non-shallow clone).
 */
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const cwd = process.cwd();

const { stdout: rootOut } = await execFileAsync('git', ['rev-parse', '--show-toplevel'], { cwd });
const repoRoot = rootOut.trim();
const docsBase = path.resolve(cwd, 'src', 'content', 'docs');

const { stdout } = await execFileAsync(
    'git',
    [
        'log',
        '--pretty=format:SITEMAPDATE %ai',
        '--name-only',
        '--diff-filter=ACM',
        '--',
        'src/content/docs/',
        'src/pages/',
    ],
    { cwd, timeout: 60_000, maxBuffer: 50 * 1024 * 1024 }
);

const map = {};
let currentDate = null;

for (const line of stdout.split('\n')) {
    if (line.startsWith('SITEMAPDATE ')) {
        const d = new Date(line.slice(12));
        currentDate = isNaN(d.getTime()) ? null : d.toISOString();
    } else if (line.trim() && currentDate) {
        const absPath = path.join(repoRoot, line.trim());
        // Mirror the key normalisation in buildDateMap: collapse all files under a
        // docs top-level folder to that folder's path (one entry per page, not per file).
        const key = absPath.startsWith(docsBase + path.sep)
            ? path.join(docsBase, absPath.slice(docsBase.length + 1).split(path.sep)[0])
            : absPath;
        const rel = path.relative(cwd, key);
        if (!map[rel]) map[rel] = currentDate;
    }
}

const outDir = path.join(cwd, '.astro', 'cache');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'sitemap-lastmod.json'), JSON.stringify(map, null, 2));
console.log(`Wrote ${Object.keys(map).length} entries to .astro/cache/sitemap-lastmod.json`);
