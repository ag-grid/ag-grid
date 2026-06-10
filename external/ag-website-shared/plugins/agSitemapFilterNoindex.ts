import type { AstroIntegration } from 'astro';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Astro integration that removes non-indexable URLs from the generated sitemap.
 *
 * Must be placed after sitemap() and before agSitemapLastmod() / agCacheSitemap()
 * in the integrations array so it operates on the freshly-generated file.
 *
 * Pass `enabled: true` only for production builds. Staging domains that share
 * the ag-grid.com TLD must not be treated as production here because all their
 * pages carry a noindex tag, which would produce an empty sitemap.
 */
export default function agSitemapFilterNoindex({ enabled = false }: { enabled?: boolean } = {}): AstroIntegration {
    let baseUrl = '/';

    return {
        name: 'ag-sitemap-filter-noindex',
        hooks: {
            'astro:config:done': ({ config }) => {
                baseUrl = config.base ?? '/';
            },

            'astro:build:done': async ({ dir, logger }) => {
                if (!enabled) {
                    logger.info('Skipping noindex filter (non-production build).');
                    return;
                }

                const outputDir = fileURLToPath(dir);
                const sitemapPath = path.join(outputDir, 'sitemap-0.xml');

                let xml: string;
                try {
                    xml = await fs.readFile(sitemapPath, 'utf8');
                } catch (error) {
                    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                        logger.warn('sitemap-0.xml not found — skipping noindex filter');
                        return;
                    }
                    throw error;
                }

                const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
                const noindexUrls = new Set<string>();

                await Promise.all(
                    urls.map(async (url) => {
                        let pathname: string;
                        try {
                            pathname = new URL(url).pathname;
                        } catch {
                            return;
                        }

                        const base = baseUrl.replace(/\/$/, '');
                        const relative = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
                        const htmlFile = path.join(outputDir, relative, 'index.html');

                        let html: string;
                        try {
                            html = await fs.readFile(htmlFile, 'utf8');
                        } catch {
                            return;
                        }

                        if (/content=["'][^"']*noindex/i.test(html)) {
                            noindexUrls.add(url);
                        }
                    })
                );

                if (noindexUrls.size === 0) {
                    logger.info('No noindex URLs found in sitemap.');
                    return;
                }

                const filtered = xml.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
                    const match = block.match(/<loc>([^<]+)<\/loc>/);
                    return match && noindexUrls.has(match[1]) ? '' : block;
                });

                await fs.writeFile(sitemapPath, filtered, 'utf8');
                logger.info(`Removed ${noindexUrls.size} noindex URL(s) from sitemap: ${[...noindexUrls].join(', ')}`);
            },
        },
    };
}
