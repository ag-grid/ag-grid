import { promises as fs } from 'node:fs';
import path from 'node:path';

import { BUILD_USER_AGENT } from '../constants';
import { type ConsumedSitemapRecord, writeConsumedSitemapRecord } from './consumedSitemapRecord';
import { getGitHash } from './gitUtils';

type Logger = Pick<Console, 'info' | 'warn' | 'log'>;

type GetSitemapXmlOptions = {
    cacheDir: string;
    sitemapUrl: string;
    logger?: Logger;
    gitHash?: string;
    /**
     * When set, the resolved sitemap is recorded here so `buildWithSitemapCache` can tell whether
     * the sitemap this page rendered from matches the one the build then generated, and skip the
     * second build when it does. Omit to record nothing.
     */
    recordDir?: string;
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
    recordDir,
}: GetSitemapXmlOptions): Promise<string> => {
    const cacheFolder = path.resolve(cacheDir);
    const cachedSitemapPath = path.join(cacheFolder, 'sitemap-0.xml');
    const cachedMetaPath = path.join(cacheFolder, 'debug', 'meta.json');
    const currentHash = gitHash ?? getGitHash();

    let xmlSitemap: string | null = null;
    let source: ConsumedSitemapRecord['source'] = 'cache';
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
        const response = await fetch(sitemapUrl, { headers: { 'User-Agent': BUILD_USER_AGENT } });
        if (!response.ok) {
            // Without this the error response body is used as the sitemap, silently producing a
            // broken `/sitemap` page instead of failing the build.
            throw new Error(`Failed to fetch sitemap ${sitemapUrl}: ${response.status} ${response.statusText}`);
        }
        xmlSitemap = await response.text();
        source = 'live';
        logger.log(`⚠️ No cached sitemap found, fetched from live site: ${sitemapUrl}`);
    }

    if (recordDir) {
        try {
            await writeConsumedSitemapRecord({
                recordDir,
                xmlSitemap,
                source,
                sitemapUrl: source === 'live' ? sitemapUrl : undefined,
            });
        } catch (error) {
            // Only costs a redundant second build, so never fail the page over it.
            logger.warn(`⚠️ Could not record the sitemap this build rendered from: ${error}`);
        }
    }

    return xmlSitemap;
};
