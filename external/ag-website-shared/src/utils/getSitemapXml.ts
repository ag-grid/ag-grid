import { promises as fs } from 'node:fs';
import path from 'node:path';

import { getGitHash } from './gitUtils';

type Logger = Pick<Console, 'info' | 'warn' | 'log'>;

type GetSitemapXmlOptions = {
    cacheDir: string;
    sitemapUrl: string;
    logger?: Logger;
    gitHash?: string;
};

const readCachedHash = async (cachedMetaPath: string) => {
    try {
        const raw = await fs.readFile(cachedMetaPath, 'utf8');
        const cachedMeta = JSON.parse(raw);
        return cachedMeta?.git?.hash ?? null;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }

        throw error;
    }
};

export const getSitemapXml = async ({
    cacheDir,
    sitemapUrl,
    logger = console,
    gitHash,
}: GetSitemapXmlOptions): Promise<string> => {
    const cacheFolder = path.resolve(cacheDir);
    const cachedSitemapPath = path.join(cacheFolder, 'sitemap-0.xml');
    const cachedMetaPath = path.join(cacheFolder, 'debug', 'meta.json');
    const currentHash = gitHash ?? getGitHash();

    let xmlSitemap: string | null = null;
    try {
        await fs.access(cachedSitemapPath);
        const cachedHash = await readCachedHash(cachedMetaPath);

        xmlSitemap = await fs.readFile(cachedSitemapPath, 'utf8');
        if (cachedHash === currentHash) {
            logger.info(`✅ Sitemap cache hash match. Using '${cachedSitemapPath}' for hash '${currentHash}'`);
        } else {
            logger.warn(`⚠️ Sitemap cache hash mismatch. Current: ${currentHash}, cached: ${cachedHash ?? 'unknown'}.`);
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
    }

    if (xmlSitemap == null) {
        const response = await fetch(sitemapUrl);
        xmlSitemap = await response.text();
        logger.log(`⚠️ No cached sitemap found, fetched from live site: ${sitemapUrl}`);
    }

    return xmlSitemap;
};
