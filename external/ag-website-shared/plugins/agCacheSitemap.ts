import type { AstroIntegration } from 'astro';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffSitemapLocs, getSitemapLocs } from '../src/utils/sitemapLocs';

type Options = {
    cacheFolder: string;
};

const readFileOrNull = async (filePath: string) => {
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }

        throw error;
    }
};

export default function createPlugin({ cacheFolder }: Options): AstroIntegration {
    return {
        name: 'ag-cache-sitemap',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                const outputDir = fileURLToPath(dir);
                const sitemapSourcePath = path.join(outputDir, 'sitemap-0.xml');
                const metaSourcePath = path.join(outputDir, 'debug', 'meta.json');

                const cacheRoot = path.resolve(cacheFolder);
                const cacheSitemapPath = path.join(cacheRoot, 'sitemap-0.xml');
                const cacheMetaPath = path.join(cacheRoot, 'debug', 'meta.json');

                const generatedXml = await readFileOrNull(sitemapSourcePath);
                if (generatedXml == null) {
                    logger.warn('sitemap-0.xml not found — nothing to cache.');
                    return;
                }

                // Cached on the page list rather than the git hash: a commit that touches no page
                // leaves the sitemap identical, and a rebuild at the same commit can still change it
                // (uncommitted content edits), so the hash answers neither question. The page list is
                // also all the sitemap page renders, so an unchanged list means an unchanged page.
                const cachedXml = await readFileOrNull(cacheSitemapPath);
                const sitemapUnchanged =
                    cachedXml != null &&
                    diffSitemapLocs(getSitemapLocs(cachedXml), getSitemapLocs(generatedXml)).matches;

                await fs.mkdir(path.dirname(cacheMetaPath), { recursive: true });
                if (sitemapUnchanged) {
                    // Only the meta, so the recorded git hash tracks the build that last confirmed
                    // this sitemap and `getSitemapXml` does not report the cache as stale.
                    await fs.copyFile(metaSourcePath, cacheMetaPath);
                    logger.info('Cached sitemap already lists the same pages — left in place.');
                    return;
                }

                await fs.copyFile(sitemapSourcePath, cacheSitemapPath);
                await fs.copyFile(metaSourcePath, cacheMetaPath);
                logger.info(`Cached sitemap with ${getSitemapLocs(generatedXml).length} page(s).`);
            },
        },
    };
}
