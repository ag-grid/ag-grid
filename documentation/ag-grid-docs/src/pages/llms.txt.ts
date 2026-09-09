import parseSitemap from '@ag-website-shared/components/sitemap/utils/sitemaputils';
import { SITEMAP_BUILD_DIR, SITEMAP_CACHE_DIR } from '@ag-website-shared/constants';
import { getSitemapXml } from '@ag-website-shared/utils/getSitemapXml';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { siteRootUrl } from '@ag-website-shared/utils/structuredData';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { DISABLE_MARKDOWN_DOCS, LIVE_SITEMAP_URL, PRODUCTION_GRID_SITE_URL, agGridVersion } from '@constants';
import { buildLlmsTxt } from '@utils/agentReadinessFiles';
import { navPageNames, navSectionsToIndex } from '@utils/docsNavIndex';
import { buildSitePageIndex } from '@utils/sitePageIndex';
import { type CollectionEntry, getEntry } from 'astro:content';

// Served at /llms.txt. Generated on every build from the canonical base URL and
// the current major version, so it cannot drift from the shipped product (SE-77).
// It also publishes the complete page index: the docs in navigation order, then the rest of the
// site from the same parsed sitemap /sitemap renders. See docsNavIndex.ts and sitePageIndex.ts.

/** The docs framework whose URLs the index publishes; the others are a segment substitution. */
const CANONICAL_FRAMEWORK = 'javascript';

export async function GET() {
    const { data: metadata } = (await getEntry('metadata', 'metadata')) as CollectionEntry<'metadata'>;
    const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;
    const { data: apiNavData } = (await getEntry('apiNav', 'nav')) as CollectionEntry<'apiNav'>;

    // The published index is the canonical one, matching the curated links above it, so it uses
    // the canonical base rather than the current environment's origin.
    const siteRoot = siteRootUrl(metadata.canonicalUrlBase);

    const docsIndex = [
        ...navSectionsToIndex({ sections: docsNavData.sections, framework: CANONICAL_FRAMEWORK, siteRoot }),
        ...navSectionsToIndex({
            sections: apiNavData.sections,
            framework: CANONICAL_FRAMEWORK,
            siteRoot,
            titlePrefix: 'Reference',
        }),
    ];

    const sitemapUrl = LIVE_SITEMAP_URL || `${PRODUCTION_GRID_SITE_URL}/sitemap-0.xml`;
    const xmlSitemap = await getSitemapXml({
        cacheDir: SITEMAP_CACHE_DIR,
        sitemapUrl,
        recordDir: SITEMAP_BUILD_DIR,
    });
    const siteIndex = buildSitePageIndex({
        parsedSitemap: parseSitemap(xmlSitemap),
        navPages: new Set([...navPageNames(docsNavData.sections), ...navPageNames(apiNavData.sections)]),
        canonicalFramework: CANONICAL_FRAMEWORK,
    });

    const output = buildLlmsTxt({
        siteRoot,
        majorVersion: parseVersion(agGridVersion).major,
        gridDocsPrefix: getFrameworkPath(CANONICAL_FRAMEWORK),
        includeMarkdownDocs: !DISABLE_MARKDOWN_DOCS,
        docsIndex,
        siteIndex,
    });

    return new Response(output, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
