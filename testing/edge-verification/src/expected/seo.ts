/** Page-level SEO expectations, from the SE tickets' QA steps. Paths are on www.ag-grid.com. */

export const PAGES = {
    home: '/',
    reactDocs: '/react-data-grid/getting-started/',
    jsDocs: '/javascript-data-grid/getting-started/',
    vueDocs: '/vue-data-grid/getting-started/',
    whatsNew: '/whats-new/',
    about: '/about/',
    pricing: '/license-pricing/',
    letsCook: '/community/lets-cook/',
    powerOfCharts: '/campaigns/power-of-ag-charts/',
    // SE-48's example override page; /campaigns/beyond-the-prompt/ now 301s here.
    beyondThePrompt: '/community/beyond-the-prompt/',
    chartsHome: '/charts/',
    chartsDocs: '/charts/react/quick-start/',
    studioHome: '/studio/',
    studioDocs: '/studio/javascript/quick-start/',
    chartsWhatsNew: '/charts/whats-new/',
    studioCommunity: '/studio/community/',
} as const;

/** SE-41: the hero H1, server-rendered once with the default framework (aria-hidden layout copies excluded). */
export const HOME_H1 = /^The Best\s*JavaScript\s*Grid in the World$/;
/** SE-41: the charts hero H1, once <noscript> and aria-hidden copies are set aside. */
export const CHARTS_H1 = /^The Best\s*JavaScript\s*Charts in the World$/;
/** SE-41: the other framework words must not be in the server-rendered H1 at all. */
export const OTHER_FRAMEWORKS = /\b(React|Angular|Vue)\b/;

/** SE-43 (URLs carry the trailing slash since SE-166). */
export const SITE_NAVIGATION: Record<string, string> = {
    'AG Charts': 'https://www.ag-grid.com/charts/',
    'AG Studio': 'https://www.ag-grid.com/studio/',
    Demos: 'https://www.ag-grid.com/example/',
    'Theme Builder': 'https://www.ag-grid.com/theme-builder/',
    Docs: 'https://www.ag-grid.com/react-data-grid/getting-started/',
    API: 'https://www.ag-grid.com/react-data-grid/reference/',
    Community: 'https://www.ag-grid.com/community/',
    Pricing: 'https://www.ag-grid.com/license-pricing/',
};
export const HOME_GRAPH_TYPES = ['Organization', 'WebSite', 'SoftwareApplication', 'SiteNavigationElement', 'FAQPage'];
export const FAQ_COUNT = 12;

/** SE-71 (second change, 2026-08-25 QA). */
export const ORGANIZATION = {
    '@id': 'https://www.ag-grid.com/#organization',
    url: 'https://www.ag-grid.com/',
    name: 'AG Grid',
    legalName: 'AG Grid Ltd',
    description:
        'AG Grid is a JavaScript data grid and charting library for building enterprise web applications, developed by AG Grid Ltd. Its product family is AG Grid, AG Charts and AG Studio.',
    foundingDate: '2010-07-19',
    streetAddress: '70 Wilson Street',
    identifiers: { 'Companies House': '07318192', VAT: 'GB998360167' },
    sameAsMustInclude: [
        'https://x.com/ag_grid',
        'https://www.crunchbase.com/organization/ag-grid',
        'https://www.wikidata.org/wiki/Q128283374',
        'https://youtube.com/c/ag-grid',
        'https://www.linkedin.com/company/ag-grid',
    ],
    sameAsMustIncludeHost: ['github.com'],
    sameAsMustExclude: [/npmjs\.com/, /twitter\.com/],
    founder: { name: 'Niall Crosby', sameAs: 'https://www.wikidata.org/wiki/Q114758691' },
    contactAreaServed: 'Worldwide',
    softwareSameAs: 'https://www.npmjs.com/package/ag-grid-community',
};

/** SE-162: docs pages carry only the valid Community offer. */
export const DOCS_OFFER = { name: 'AG Grid Community', price: '0' };
export const CHARTS_OFFER = { name: 'AG Charts Community', price: '0' };
/** Sean, 2026-10-02: studio keeps its Community offer, as every studio page emits it live. */
export const STUDIO_OFFER = { name: 'AG Studio Community', price: '0' };

/** SE-63: each framework's docs page describes its own examples, tied to that page's article. */
export const DOCS_SOURCE_PLATFORMS: Array<{ page: 'reactDocs' | 'vueDocs'; runtimePlatform: string }> = [
    { page: 'reactDocs', runtimePlatform: 'React' },
    { page: 'vueDocs', runtimePlatform: 'Vue' },
];

/** SE-183: a disallowed changelog search URL still loads for a visitor. */
export const CHANGELOG_SEARCH = { path: '/changelog/?searchQuery=edge-check', title: /Changelog/ };

/** SE-166: internal link targets that redirect; none may appear as an href on these pages. */
export const REDIRECTING_HREFS = [
    '/charts',
    '/studio',
    '/whats-new',
    '/charts/whats-new',
    '/studio/whats-new',
    '/cookies',
    '/privacy',
    '/example',
    '/cookies.php',
    '/license-pricing.php',
    '/privacy.php',
    '/about.php',
    '/ag-grid-changelog/',
    '/ag-grid-pipeline/',
    '/javascript-grid/getting-started/',
    '/react-getting-started/',
    '/angular-getting-started/',
    '/vue-getting-started/',
];

/** SE-113 / SE-87: the literal attribute pattern Sean's crawl matched (island JSON cannot produce it). */
export const OLD_BLOG_HREF = 'href="https://blog.ag-grid.com';
