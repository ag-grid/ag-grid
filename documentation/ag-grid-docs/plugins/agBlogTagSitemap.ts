import type { AstroIntegration } from 'astro';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { BLOG_TAG_SITEMAP_FILE, fallbackBlogTagSitemap, filterBlogTagSitemap } from '../src/utils/blogTagSitemap';

/**
 * SE-106: writes `sitemap-blog-tags.xml`, Ghost's tag sitemap filtered to the indexable tags, so it
 * can be listed in the sitemap index. Refreshed on each docs build.
 *
 * Does nothing when `ghostSitemapUrl` is not set.
 */
export default function agBlogTagSitemap({ ghostSitemapUrl }: { ghostSitemapUrl?: string }): AstroIntegration {
    return {
        name: 'ag-blog-tag-sitemap',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                if (!ghostSitemapUrl) {
                    logger.info('BLOG_TAGS_SITEMAP_URL not set - skipping the blog tag sitemap.');
                    return;
                }

                let xml: string;
                try {
                    const response = await fetch(ghostSitemapUrl, { signal: AbortSignal.timeout(30_000) });
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const result = filterBlogTagSitemap(await response.text());
                    if (result.missing.length) {
                        logger.warn(`Indexable blog tag(s) not in ${ghostSitemapUrl}: ${result.missing.join(', ')}`);
                    }
                    xml = result.xml;
                } catch (error) {
                    logger.warn(
                        `Could not fetch ${ghostSitemapUrl} (${(error as Error).message}) - writing the tag URLs without lastmod.`
                    );
                    xml = fallbackBlogTagSitemap(ghostSitemapUrl);
                }

                await fs.writeFile(path.join(fileURLToPath(dir), BLOG_TAG_SITEMAP_FILE), xml, 'utf8');
                logger.info(`Wrote ${BLOG_TAG_SITEMAP_FILE}.`);
            },
        },
    };
}
