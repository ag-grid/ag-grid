import type { AstroIntegration } from 'astro';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRID_SITEMAP_INDEX_FILE = 'sitemap-index.xml';

interface Options {
    sitemapIndexUrl: string;
}

/**
 * Merge sitemap from another Astro sitemap index
 */
export default function createPlugin(options: Options): AstroIntegration {
    return {
        name: 'ag-merge-sitemap',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                if (!options?.sitemapIndexUrl) {
                    logger.info('No sitemapIndexUrl specified, skipping');
                    return;
                }

                const destDir = fileURLToPath(dir.href);

                const parser = new XMLParser({ ignoreAttributes: false });
                const gridSitemapIndexFile = join(destDir, GRID_SITEMAP_INDEX_FILE);
                const gridSitemapIndex = readFileSync(gridSitemapIndexFile);

                const otherSitemapIndexPromise = await fetch(options.sitemapIndexUrl);
                const otherSitemapIndex = await otherSitemapIndexPromise.text();

                const gridSitemapParsed = parser.parse(gridSitemapIndex);
                const otherSitemapParsed = parser.parse(otherSitemapIndex);

                if (Array.isArray(gridSitemapParsed.sitemapindex.sitemap)) {
                    gridSitemapParsed.sitemapindex.sitemap = gridSitemapParsed.sitemapindex.sitemap.concat(
                        otherSitemapParsed.sitemapindex.sitemap
                    );
                } else if (typeof gridSitemapParsed.sitemapindex.sitemap === 'object') {
                    gridSitemapParsed.sitemapindex.sitemap = [gridSitemapParsed.sitemapindex.sitemap].concat(
                        otherSitemapParsed.sitemapindex.sitemap
                    );
                }

                const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
                const updatedSitemapIndex = builder.build(gridSitemapParsed);

                // Overwrite sitemap
                writeFileSync(gridSitemapIndexFile, updatedSitemapIndex);
                logger.info(`Merged sitemap from ${options.sitemapIndexUrl} into ${GRID_SITEMAP_INDEX_FILE}`);
            },
        },
    };
}
