import type { AstroIntegration } from 'astro';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getGitHash } from '../src/utils/gitUtils';

type Options = {
    cacheFolder: string;
};

export default function createPlugin({ cacheFolder }: Options): AstroIntegration {
    return {
        name: 'ag-cache-sitemap',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                const currentHash = getGitHash();
                const outputDir = fileURLToPath(dir);
                const sitemapSourcePath = path.join(outputDir, 'sitemap-0.xml');
                const metaSourcePath = path.join(outputDir, 'debug', 'meta.json');

                const cacheRoot = path.resolve(cacheFolder);
                const cacheSitemapPath = path.join(cacheRoot, 'sitemap-0.xml');
                const cacheMetaPath = path.join(cacheRoot, 'debug', 'meta.json');

                const readCachedHash = async () => {
                    try {
                        const raw = await fs.readFile(cacheMetaPath, 'utf8');
                        const cachedMeta = JSON.parse(raw);
                        return cachedMeta?.git?.hash ?? null;
                    } catch (error) {
                        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                            return null;
                        }

                        throw error;
                    }
                };

                const cachedHash = await readCachedHash();
                if (cachedHash === currentHash) {
                    logger.info(`Sitemap cache already up to date for ${currentHash}.`);
                    return;
                }

                await fs.mkdir(path.dirname(cacheMetaPath), { recursive: true });
                await fs.copyFile(sitemapSourcePath, cacheSitemapPath);
                await fs.copyFile(metaSourcePath, cacheMetaPath);
                logger.info(`Cached sitemap and meta.json for ${currentHash}.`);
            },
        },
    };
}
