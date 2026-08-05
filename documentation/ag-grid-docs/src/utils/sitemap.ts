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
        // Contact form result pages
        page.endsWith('/contact/failure/') ||
        page.endsWith('/contact/success/')
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
 * 1. Sitemap xml (`sitemap-0.xml`) - after a complete build, the sitemap xml file is generated in the astro `dist` folder. It is also cached in `[documentation]/.astro/cache/sitemap/sitemap-0.xml` (from the `ag-cache-sitemap` astro plugin). The cache also stores the git hash of the build, so it can be used to determine whether to cache again
 * 2. Sitemap page (`/sitemap`) - this page is generated from the sitemap xml, however since the page cannot be generated until the build is complete, it either uses what is in the cache (from a previous build), or pulls it from `LIVE_SITEMAP_URL`
 *
 * To generate the sitemap locally:
 *
 * 1. With localhost links - run `nx build ag-grid-docs --clean-cache=true --run-second-build=true` to clear out the cache and run the build twice, so the sitemap page is updated. Preview with `nx preview ag-grid-docs`
 * 2. With production links - run the production preview with `nx preview ag-grid-docs -c production`
 *
 * Check the sitemap locally at `http://localhost:4611/sitemap-0.xml` and `http://localhost:4611/sitemap`
 */
export function getSitemapConfig({ chartsSitemap, studioSitemap }: { chartsSitemap?: string; studioSitemap?: string }) {
    const customSitemaps = [...(chartsSitemap ? [chartsSitemap] : []), ...(studioSitemap ? [studioSitemap] : [])];

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
