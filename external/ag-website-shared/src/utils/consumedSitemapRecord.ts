import { promises as fs, readFileSync } from 'node:fs';
import path from 'node:path';

import { describeSitemapLocsDiff, diffSitemapLocs, getSitemapLocs } from './sitemapLocs';

/**
 * The sitemap page is a chicken-and-egg case: it lists the pages in the sitemap, but the sitemap is
 * only generated once every page — including this one — has been built. So the page renders from a
 * *previous* sitemap (the on-disk cache, or the live site) and the build may have to run a second
 * time to re-render it against the sitemap it just generated.
 *
 * This record is how the build finds out whether that second build is actually needed: the page
 * writes down which sitemap it rendered from, and `buildWithSitemapCache` compares that against the
 * sitemap the build went on to generate.
 */
export type ConsumedSitemapRecord = {
    /** Where the sitemap came from — the on-disk cache, or a fetch from the live site. */
    source: 'cache' | 'live';
    /** Set when `source` is `live`. */
    sitemapUrl?: string;
    locs: string[];
};

const RECORD_FILE_NAME = 'consumed-sitemap.json';

export const getConsumedSitemapRecordPath = (recordDir: string) => path.join(path.resolve(recordDir), RECORD_FILE_NAME);

// Every page that renders the sitemap writes the same record, and Astro builds pages concurrently,
// so write to a private path and rename it into place — a plain write can interleave into a torn
// file that then reads back as no record at all.
let writeCount = 0;

export const writeConsumedSitemapRecord = async ({
    recordDir,
    xmlSitemap,
    source,
    sitemapUrl,
}: {
    recordDir: string;
    xmlSitemap: string;
    source: ConsumedSitemapRecord['source'];
    sitemapUrl?: string;
}) => {
    const recordPath = getConsumedSitemapRecordPath(recordDir);
    const record: ConsumedSitemapRecord = { source, sitemapUrl, locs: getSitemapLocs(xmlSitemap) };
    const tempPath = `${recordPath}.${process.pid}-${++writeCount}.tmp`;

    await fs.mkdir(path.dirname(recordPath), { recursive: true });
    await fs.writeFile(tempPath, JSON.stringify(record), 'utf8');
    await fs.rename(tempPath, recordPath);
};

/** Null when no usable record was written, which is treated as "assume the pages are out of date". */
export const readConsumedSitemapRecord = (recordDir: string): ConsumedSitemapRecord | null => {
    let raw: string;
    try {
        raw = readFileSync(getConsumedSitemapRecordPath(recordDir), 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }

        throw error;
    }

    try {
        const record = JSON.parse(raw);
        return Array.isArray(record?.locs) ? record : null;
    } catch {
        return null;
    }
};

export type SecondBuildDecision = {
    needed: boolean;
    /** Why, for the build log. */
    reason: string;
};

/**
 * Whether the sitemap pages the first build produced are already correct.
 *
 * Anything unexpected resolves to "build again": a redundant build only costs time, whereas a stale
 * sitemap page ships.
 */
export const decideSecondBuild = ({
    generatedXml,
    record,
}: {
    /** The sitemap this build generated, or null if it generated none (archive builds). */
    generatedXml: string | null;
    record: ConsumedSitemapRecord | null;
}): SecondBuildDecision => {
    if (generatedXml == null) {
        return { needed: false, reason: 'this build generates no sitemap, so the sitemap page cannot be out of date' };
    }

    if (record == null) {
        return { needed: true, reason: 'no record of which sitemap the first build rendered from' };
    }

    const diff = diffSitemapLocs(record.locs, getSitemapLocs(generatedXml));
    if (diff.matches) {
        const from = record.source === 'live' ? `the live sitemap (${record.sitemapUrl})` : 'the cached sitemap';
        return { needed: false, reason: `sitemap unchanged since ${from} — ${record.locs.length} page(s)` };
    }

    return { needed: true, reason: describeSitemapLocsDiff(diff) };
};
