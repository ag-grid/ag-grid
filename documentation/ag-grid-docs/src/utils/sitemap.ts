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
        page.endsWith('/react-data-grid/') ||
        page.endsWith('/angular-data-grid/') ||
        page.endsWith('/javascript-data-grid/') ||
        page.endsWith('/vue-data-grid/')
    );
};

/*
 * Exclude specific pages
 */
const isNonPublicContent = (page: string) => {
    return page.endsWith('/style-guide/');
};

const filterIgnoredPages = (page: string) => {
    return (
        !isExamplePage(page) &&
        !isDebugPage(page) &&
        !isRedirectPage(page) &&
        !isNonPublicContent(page) &&
        !isTestPage(page)
    );
};

export function getSitemapConfig() {
    return {
        filter: filterIgnoredPages,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date(),
    };
}
