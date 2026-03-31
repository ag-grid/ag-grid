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

export function getSitemapConfig({ chartsSitemap, studioSitemap }: { chartsSitemap?: string; studioSitemap?: string }) {
    const customSitemaps = [...(chartsSitemap ? [chartsSitemap] : []), ...(studioSitemap ? [studioSitemap] : [])];

    return {
        customSitemaps,
        filter: filterIgnoredPages,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date(),
    };
}
