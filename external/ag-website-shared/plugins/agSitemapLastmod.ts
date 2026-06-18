import type { AstroIntegration } from 'astro';
import { execFile } from 'node:child_process';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Build a map of source path → last-modified Date by running a single `git log`
 * command over the docs and pages source directories.
 */
async function buildDateMap(cwd: string): Promise<Map<string, Date>> {
    const map = new Map<string, Date>();
    try {
        const { stdout: rootOut } = await execFileAsync('git', ['rev-parse', '--show-toplevel'], { cwd });
        const repoRoot = rootOut.trim();

        const { stdout: shallowOut } = await execFileAsync('git', ['rev-parse', '--is-shallow-repository'], { cwd });
        if (shallowOut.trim() === 'true') {
            console.warn(
                '[ag-sitemap-lastmod] WARNING: This is a shallow git clone. ' +
                    'git log will only cover fetched history — sitemap lastmod dates will be incomplete.'
            );
        }

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
            { cwd, timeout: 30_000, maxBuffer: 50 * 1024 * 1024 }
        );

        let currentDate: Date | null = null;
        for (const line of stdout.split('\n')) {
            if (line.startsWith('SITEMAPDATE ')) {
                const d = new Date(line.slice(12));
                currentDate = isNaN(d.getTime()) ? null : d;
            } else if (line.trim() && currentDate) {
                const absPath = path.join(repoRoot, line.trim());
                const key = absPath.startsWith(docsBase + path.sep)
                    ? path.join(docsBase, absPath.slice(docsBase.length + 1).split(path.sep)[0])
                    : absPath;
                if (!map.has(key)) map.set(key, currentDate);
            }
        }
    } catch {
        console.error('git not available');
    }
    return map;
}

async function fileMtime(filePath: string): Promise<Date | null> {
    try {
        return (await stat(filePath)).mtime;
    } catch {
        return null;
    }
}

function pageNameFromUrl(urlStr: string, baseUrl: string): string {
    let pathname: string;
    try {
        pathname = new URL(urlStr).pathname;
    } catch {
        pathname = urlStr;
    }
    const base = baseUrl.replace(/\/$/, '');
    const relative = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
    const segments = relative.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : 'index';
}

async function lastModForUrl(urlStr: string, baseUrl: string, cwd: string, dateMap: Map<string, Date>): Promise<Date> {
    const page = pageNameFromUrl(urlStr, baseUrl);

    const docFolder = path.join(cwd, 'src', 'content', 'docs', page);
    if (dateMap.has(docFolder)) return dateMap.get(docFolder)!;

    const pageFile = path.join(cwd, 'src', 'pages', `${page}.astro`);
    if (dateMap.has(pageFile)) return dateMap.get(pageFile)!;

    return (await fileMtime(path.join(docFolder, 'index.mdoc'))) ?? (await fileMtime(pageFile)) ?? new Date();
}

async function enrichSitemap(xml: string, baseUrl: string, cwd: string, dateMap: Map<string, Date>): Promise<string> {
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

    const urlDateMap = new Map<string, Date>();
    await Promise.all(
        urls.map(async (url) => {
            urlDateMap.set(url, await lastModForUrl(url, baseUrl, cwd, dateMap));
        })
    );

    return xml.replace(/(<url>[\s\S]*?<\/url>)/g, (urlBlock) => {
        const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/);
        if (!locMatch) return urlBlock;

        const date = urlDateMap.get(locMatch[1]);
        if (!date) return urlBlock;

        return urlBlock.replace(/(<lastmod>)[^<]*(<\/lastmod>)/, `$1${date.toISOString()}$2`);
    });
}

/**
 * Astro integration that rewrites <lastmod> in the generated sitemap-0.xml
 * Should be run *before* agCacheSitemap
 */
export default function agSitemapLastmod(): AstroIntegration {
    let cwd = '';
    let baseUrl = '/';

    return {
        name: 'ag-sitemap-lastmod',
        hooks: {
            'astro:config:done': ({ config }) => {
                cwd = path.resolve(fileURLToPath(config.root));
                baseUrl = config.base ?? '/';
            },

            'astro:build:done': async ({ dir, logger }) => {
                const outputDir = fileURLToPath(dir);

                const sitemapFiles = (await readdir(outputDir)).filter((f) => /^sitemap-\d+\.xml$/.test(f));

                if (sitemapFiles.length === 0) {
                    logger.warn('No sitemap-N.xml files found — skipping lastmod enrichment');
                    return;
                }

                const dateMap = await buildDateMap(cwd);
                if (dateMap.size === 0) {
                    logger.warn('Could not read git history — falling back to filesystem mtimes');
                }

                for (const file of sitemapFiles) {
                    const sitemapPath = path.join(outputDir, file);
                    const xml = await readFile(sitemapPath, 'utf8');
                    const enriched = await enrichSitemap(xml, baseUrl, cwd, dateMap);
                    await writeFile(sitemapPath, enriched, 'utf8');
                }

                logger.info(
                    `Updated ${sitemapFiles.length} sitemap file(s) with per-page lastmod dates (${dateMap.size} source entries)`
                );
            },
        },
    };
}
