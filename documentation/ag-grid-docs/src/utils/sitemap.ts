import { FRAMEWORK_REDIRECT_PATH } from '../constants';

/**
 * Example runner pages
 */
const isExamplePage = (page: string) => {
    return page.includes('/examples/');
};

/*
 * Internal debugging pages
 */
const isDebugPage = (page: string) => {
    return page.includes('/debug/');
};

/*
 * Error pages
 */
const isErrorPage = (page: string) => {
    return page.includes('/errors/');
};

/*
 * Test pages for testing
 */
export const isTestPage = (page: string) => {
    return page.endsWith('-test/') || page.endsWith('-test') || page.endsWith('/benchmarks');
};

/*
 * Documentation redirect pages
 */
const isRedirectPage = (page: string) => {
    return (
        page.endsWith('/documentation/') ||
        (!page.endsWith('/landing-pages/react-data-grid/') && page.endsWith('/react-data-grid/')) ||
        (!page.endsWith('/landing-pages/angular-data-grid/') && page.endsWith('/angular-data-grid/')) ||
        (!page.endsWith('/landing-pages/javascript-data-grid/') && page.endsWith('/javascript-data-grid/')) ||
        (!page.endsWith('/landing-pages/vue-data-grid/') && page.endsWith('/vue-data-grid/')) ||
        page.includes(`/${FRAMEWORK_REDIRECT_PATH}/`)
    );
};

/*
 * Exclude specific pages
 */
const isNonPublicContent = (page: string) => {
    return (
        page.endsWith('/style-guide/') ||
        // Post-submission confirmation pages. These are already disallowed in robots.txt (see
        // getSitemapIgnorePaths), so listing them in the sitemap contradicts it and Search Console
        // reports them as "submitted URL blocked by robots.txt".
        page.endsWith('/contact/failure/') ||
        page.endsWith('/contact/success/') ||
        page.endsWith('/privacy/your-choice/')
    );
};

const filterIgnoredPages = (page: string) => {
    return (
        !isExamplePage(page) &&
        !isDebugPage(page) &&
        !isRedirectPage(page) &&
        !isNonPublicContent(page) &&
        !isTestPage(page) &&
        !isErrorPage(page)
    );
};

/**
 * Get the sitemap configuration for generating the sitemap xml file
 *
 * There are 2 locations where the sitemap is generated:
 *
 * 1. Sitemap xml (`sitemap-0.xml`) - after a complete build, the sitemap xml file is generated in the astro `dist` folder. It is also cached in `[documentation]/.astro/cache/sitemap/sitemap-0.xml` (from the `ag-cache-sitemap` astro plugin), which refreshes the cache whenever the page list changed
 * 2. Sitemap page (`/sitemap`) - this page is generated from the sitemap xml, however since the page cannot be generated until the build is complete, it either uses what is in the cache (from a previous build), or pulls it from `LIVE_SITEMAP_URL`
 *
 * Because of (2), a build may need to run twice for the sitemap page to list the pages the same build generated. `buildWithSitemapCache` only does that when the page list actually moved - see that script for the comparison it makes.
 *
 * To generate the sitemap locally:
 *
 * 1. With localhost links - run `nx build ag-grid-docs --clean-cache=true --run-second-build=true` to clear out the cache and allow the second build, so the sitemap page is updated. Preview with `nx preview ag-grid-docs`
 * 2. With production links - run the production preview with `nx preview ag-grid-docs -c production`
 *
 * Check the sitemap locally at `http://localhost:4611/sitemap-0.xml` and `http://localhost:4611/sitemap`
 */
/**
 * SE-85: `blogSitemaps` lists Ghost's FLAT child sitemaps (posts, pages, authors, tags), not its
 * index at /blog/sitemap.xml.
 *
 * That distinction matters. `customSitemaps` entries are emitted as <sitemap> members of our own
 * sitemap index, and the protocol requires those to be sitemap FILES — an index may not contain
 * another index, and crawlers ignore one that does, so nesting Ghost's index here would hide all
 * 291 blog URLs. Charts and studio already reference flat files (`sitemap-0.xml` is a <urlset>
 * despite the env var being named ..._INDEX_URL), so this matches them rather than inventing a
 * second shape.
 *
 * Referencing Ghost's files rather than copying their URLs means the blog's entries stay current on
 * their own — a snapshot would go stale the next time a post is published, which is precisely how
 * the 282-row redirect map fell nine URLs behind the live 291. It also leaves each post's real
 * published/modified dates in Ghost's hands: SE-85 is explicit that the move must not touch them.
 *
 * The trade-off is that the four filenames are pinned in config. Ghost's set is fixed, but if it
 * ever gains a type, /blog/sitemap.xml is the place to spot it.
 */
export function getSitemapConfig({
    chartsSitemap,
    studioSitemap,
    blogSitemaps,
}: {
    chartsSitemap?: string;
    studioSitemap?: string;
    blogSitemaps?: string[];
}) {
    const customSitemaps = [
        ...(chartsSitemap ? [chartsSitemap] : []),
        ...(studioSitemap ? [studioSitemap] : []),
        ...(blogSitemaps ?? []),
    ];

    return {
        customSitemaps,
        filter: filterIgnoredPages,
        lastmod: new Date(),
        namespaces: {
            news: false,
            xhtml: false,
            image: false,
            video: false,
        },
    };
}
