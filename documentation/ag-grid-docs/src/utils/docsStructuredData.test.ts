import { type JsonLdObject, buildAgGridOrganization } from '@ag-website-shared/utils/structuredData';

import homepageFaqs from '../content/faqs/homepage.json';
import {
    buildDocsPageStructuredData,
    buildExampleSourceCode,
    buildHomepageFAQPage,
    buildSiteStructuredData,
    getDocsPageUrl,
    getExampleSourceCodeProperties,
} from './docsStructuredData';

const CANONICAL_URL_BASE = 'https://www.ag-grid.com';

const findNode = (nodes: JsonLdObject[], type: string) => nodes.find((node) => node['@type'] === type)!;

const buildSiteNodes = (version = '36.0.0') =>
    buildSiteStructuredData({
        canonicalUrlBase: CANONICAL_URL_BASE,
        name: 'AG Grid',
        description: 'The best data grid.',
        version,
    });

describe('buildSiteStructuredData', () => {
    // SE-43
    test('emits the Organization, WebSite and SoftwareApplication on every page', () => {
        expect(buildSiteNodes().map((node) => node['@type'])).toEqual([
            'Organization',
            'WebSite',
            'SoftwareApplication',
        ]);
    });

    // SE-71
    test('the Organization is the AG Grid Ltd company node', () => {
        expect(findNode(buildSiteNodes(), 'Organization')).toEqual(buildAgGridOrganization());
    });

    // SE-162: an offer without a price is invalid, so only the free Community offer is listed
    test('the SoftwareApplication lists exactly one offer, the free Community one, and no rating', () => {
        const application = findNode(buildSiteNodes(), 'SoftwareApplication');

        expect(application.offers).toEqual([
            {
                '@type': 'Offer',
                name: 'AG Grid Community',
                price: '0',
                priceCurrency: 'USD',
                url: `${CANONICAL_URL_BASE}/license-pricing/`,
            },
        ]);
        expect(application.aggregateRating).toBeUndefined();
        expect(application.review).toBeUndefined();
    });

    test('drops any pre-release suffix from the software version', () => {
        expect(findNode(buildSiteNodes('36.0.0-beta.20260101'), 'SoftwareApplication').softwareVersion).toBe('36.0.0');
    });

    // SE-47: the FAQPage belongs to the home page alone
    test('emits no FAQPage', () => {
        expect(buildSiteNodes().map((node) => node['@type'])).not.toContain('FAQPage');
    });
});

describe('buildHomepageFAQPage', () => {
    // SE-47
    test('emits a Question per home page FAQ, keyed to the site root', () => {
        const faqPage = buildHomepageFAQPage({ canonicalUrlBase: CANONICAL_URL_BASE, items: homepageFaqs });

        expect(faqPage['@id']).toBe(`${CANONICAL_URL_BASE}/#faq`);
        expect((faqPage.mainEntity as JsonLdObject[]).map((question) => question.name)).toEqual(
            homepageFaqs.map(({ question }) => question)
        );
    });

    test('reduces every home page answer to plain text', () => {
        const faqPage = buildHomepageFAQPage({ canonicalUrlBase: CANONICAL_URL_BASE, items: homepageFaqs });

        for (const question of faqPage.mainEntity as JsonLdObject[]) {
            const { text } = question.acceptedAnswer as { text: string };
            expect(text).not.toMatch(/\]\(|\*\*|`/);
        }
    });

    test.each([
        ['a link', 'See [the docs](./getting-started/).', 'See the docs.'],
        ['an image', '![AG Grid logo](/logo.png) inside', 'AG Grid logo inside'],
        ['bold and italic emphasis', '**Free** and _open_', 'Free and open'],
        ['inline code', 'Set `rowData`.', 'Set rowData.'],
        ['line-leading list and heading markers', '# Title\n- one\n2. two', 'Title\none\ntwo'],
    ])('strips %s from an answer', (_, answer, text) => {
        const faqPage = buildHomepageFAQPage({
            canonicalUrlBase: CANONICAL_URL_BASE,
            items: [{ question: 'Q', answer }],
        });

        expect((faqPage.mainEntity as JsonLdObject[])[0].acceptedAnswer).toEqual({ '@type': 'Answer', text });
    });
});

describe('buildDocsPageStructuredData', () => {
    test('emits the TechArticle, docs topic and BreadcrumbList for the page', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'react',
            pageName: 'column-definitions',
            title: 'Column Definitions',
            description: 'Define each column.',
        });

        expect(nodes.map((node) => node['@type'])).toEqual(['TechArticle', 'CreativeWork', 'BreadcrumbList']);
    });

    // SE-162: product offers sit on the site-wide SoftwareApplication, not on each docs page
    test('emits no product, offer or FAQ nodes of its own', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'react',
            pageName: 'getting-started',
            title: 'Quick Start',
            description: 'Get started.',
        });

        for (const type of ['SoftwareApplication', 'Product', 'Offer', 'FAQPage']) {
            expect(nodes.map((node) => node['@type'])).not.toContain(type);
        }
    });

    test('names the framework in the article keywords and dependencies, and links it to the product', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'vue',
            pageName: 'column-definitions',
            title: 'Column Definitions',
            description: 'Define each column.',
        });
        const article = findNode(nodes, 'TechArticle');

        expect(article.keywords).toEqual(['Vue', 'Vue Data Grid', 'AG Grid', 'Column Definitions']);
        expect(article.dependencies).toBe('ag-grid-vue3');
        expect(article.about).toEqual({ '@id': `${CANONICAL_URL_BASE}/#software-application` });
    });

    test('adds ag-grid-enterprise to the dependencies of an enterprise page', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'javascript',
            pageName: 'server-side-model',
            title: 'Server-Side Row Model',
            description: 'Load rows from the server.',
            isEnterprise: true,
        });

        expect(findNode(nodes, 'TechArticle').dependencies).toBe('ag-grid-community, ag-grid-enterprise');
    });

    test('every framework variant of a page shares one topic that lists all of them', () => {
        const topicsByFramework = (['react', 'angular', 'vue', 'javascript'] as const).map((framework) => {
            const nodes = buildDocsPageStructuredData({
                canonicalUrlBase: CANONICAL_URL_BASE,
                framework,
                pageName: 'column-definitions',
                title: 'Column Definitions',
                description: 'Define each column.',
            });
            const article = findNode(nodes, 'TechArticle');
            const topic = findNode(nodes, 'CreativeWork');
            expect(article.isPartOf).toContainEqual({ '@id': topic['@id'] });
            return topic;
        });

        for (const topic of topicsByFramework) {
            expect(topic).toEqual(topicsByFramework[0]);
        }
        expect(topicsByFramework[0].hasPart).toEqual([
            { '@id': `${CANONICAL_URL_BASE}/react-data-grid/column-definitions/#article` },
            { '@id': `${CANONICAL_URL_BASE}/angular-data-grid/column-definitions/#article` },
            { '@id': `${CANONICAL_URL_BASE}/vue-data-grid/column-definitions/#article` },
            { '@id': `${CANONICAL_URL_BASE}/javascript-data-grid/column-definitions/#article` },
        ]);
    });

    test('limits the topic to the frameworks a restricted page is generated for', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'react',
            pageName: 'react-hooks',
            title: 'React Hooks',
            description: 'Use hooks.',
            frameworks: ['react'],
        });

        expect(findNode(nodes, 'CreativeWork').hasPart).toEqual([
            { '@id': `${CANONICAL_URL_BASE}/react-data-grid/react-hooks/#article` },
        ]);
    });

    test('breadcrumbs go from the site root through the framework landing hub to the page', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'angular',
            pageName: 'column-definitions',
            title: 'Column Definitions',
            description: 'Define each column.',
        });

        expect(findNode(nodes, 'BreadcrumbList').itemListElement).toEqual([
            { '@type': 'ListItem', position: 1, name: 'AG Grid', item: `${CANONICAL_URL_BASE}/` },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Angular Data Grid',
                item: `${CANONICAL_URL_BASE}/angular-data-grid/`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: 'Column Definitions',
                item: `${CANONICAL_URL_BASE}/angular-data-grid/column-definitions/`,
            },
        ]);
    });

    test('a framework without a landing hub uses its redirect target as the framework crumb', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'javascript',
            pageName: 'column-definitions',
            title: 'Column Definitions',
            description: 'Define each column.',
        });

        expect((findNode(nodes, 'BreadcrumbList').itemListElement as JsonLdObject[])[1]).toEqual({
            '@type': 'ListItem',
            position: 2,
            name: 'JavaScript Data Grid',
            item: `${CANONICAL_URL_BASE}/javascript-data-grid/getting-started/`,
        });
    });

    test('drops the framework crumb on the redirect target itself rather than repeating the page', () => {
        const nodes = buildDocsPageStructuredData({
            canonicalUrlBase: CANONICAL_URL_BASE,
            framework: 'javascript',
            pageName: 'getting-started',
            title: 'Quick Start',
            description: 'Get started.',
        });

        expect((findNode(nodes, 'BreadcrumbList').itemListElement as JsonLdObject[]).map((item) => item.item)).toEqual([
            `${CANONICAL_URL_BASE}/`,
            `${CANONICAL_URL_BASE}/javascript-data-grid/getting-started/`,
        ]);
    });
});

describe('buildExampleSourceCode', () => {
    // SE-63: each framework variant's example is its own node, linked to that variant's article
    test.each([
        ['react', 'reactFunctionalTs', 'TypeScript', 'React'],
        ['angular', 'angular', 'TypeScript', 'Angular'],
        ['vue', 'vue3', 'TypeScript', 'Vue'],
        ['javascript', 'vanilla', 'JavaScript', 'JavaScript'],
    ] as const)('a %s page example', (framework, internalFramework, programmingLanguage, runtimePlatform) => {
        const pageUrl = `${CANONICAL_URL_BASE}/${framework}-data-grid/filtering/`;

        expect(
            buildExampleSourceCode({
                canonicalUrlBase: CANONICAL_URL_BASE,
                framework,
                pageName: 'filtering',
                exampleName: 'provided-filters',
                internalFramework,
            })
        ).toEqual({
            '@type': 'SoftwareSourceCode',
            '@id': `${pageUrl}#source-code-provided-filters`,
            name: 'provided-filters',
            programmingLanguage,
            runtimePlatform,
            codeSampleType: 'full',
            url: pageUrl,
            about: { '@id': `${pageUrl}#article` },
        });
    });
});

describe('getDocsPageUrl', () => {
    test('builds the canonical framework docs URL with a trailing slash', () => {
        expect(
            getDocsPageUrl({ canonicalUrlBase: CANONICAL_URL_BASE, framework: 'react', pageName: 'filtering' })
        ).toBe(`${CANONICAL_URL_BASE}/react-data-grid/filtering/`);
    });
});

describe('getExampleSourceCodeProperties', () => {
    test.each([
        ['typescript', 'TypeScript', 'JavaScript'],
        ['vanilla', 'JavaScript', 'JavaScript'],
        ['reactFunctionalTs', 'TypeScript', 'React'],
        ['reactFunctional', 'JavaScript', 'React'],
        ['angular', 'TypeScript', 'Angular'],
        ['vue3', 'TypeScript', 'Vue'],
    ] as const)('%s source is %s on %s', (internalFramework, programmingLanguage, runtimePlatform) => {
        expect(getExampleSourceCodeProperties(internalFramework)).toEqual({ programmingLanguage, runtimePlatform });
    });
});
