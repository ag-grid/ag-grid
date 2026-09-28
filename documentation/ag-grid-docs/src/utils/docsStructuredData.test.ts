import type { JsonLdObject } from '@ag-website-shared/utils/structuredData';

import { buildDocsPageStructuredData, getDocsPageUrl } from './docsStructuredData';

const CANONICAL_URL_BASE = 'https://www.ag-grid.com';

const findNode = (nodes: JsonLdObject[], type: string) => nodes.find((node) => node['@type'] === type)!;

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

describe('getDocsPageUrl', () => {
    test('builds the canonical framework docs URL with a trailing slash', () => {
        expect(
            getDocsPageUrl({ canonicalUrlBase: CANONICAL_URL_BASE, framework: 'react', pageName: 'filtering' })
        ).toBe(`${CANONICAL_URL_BASE}/react-data-grid/filtering/`);
    });
});
