import { createAlternativePageSchema } from '@ag-website-shared/components/decision-pages/alternativePageSchema';
import { createComparisonPageSchema } from '@ag-website-shared/components/decision-pages/comparisonPageSchema';
import { createProductAlternativePageSchema } from '@ag-website-shared/components/decision-pages/productAlternativePageSchema';
import { createSolutionPageSchema } from '@ag-website-shared/components/decision-pages/solutionPageSchema';
import type {
    AlternativePageSource,
    ComparisonPageContent,
    ProductAlternativePageContent,
    SolutionPageContent,
} from '@ag-website-shared/components/decision-pages/types';
import gridFeaturesMatrix from '@ag-website-shared/content/license-features/gridFeaturesMatrix.json';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { PRODUCT_ALTERNATIVE_SLUG, alternativePagePaths, decisionRelatedPages } from './decisionPages';
import { TECHNICAL_REVIEWER_KEYS } from './technicalReviewers';

const readPages = (dir: string) => {
    const contentDir = join(__dirname, '../content', dir);
    return readdirSync(contentDir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => ({
            slug: file.replace(/\.json$/, ''),
            json: JSON.parse(readFileSync(join(contentDir, file), 'utf8')),
        }));
};

const COMPARE_PAGES = readPages('compare');
const ALTERNATIVE_PAGES = readPages('alternatives');
const PRODUCT_ALTERNATIVE_PAGES = readPages('product-alternatives');
const SOLUTION_PAGES = readPages('solutions');

const compareSchema = createComparisonPageSchema({ reviewerKeys: TECHNICAL_REVIEWER_KEYS });
const alternativeSchema = createAlternativePageSchema({ reviewerKeys: TECHNICAL_REVIEWER_KEYS });
const productAlternativeSchema = createProductAlternativePageSchema({ reviewerKeys: TECHNICAL_REVIEWER_KEYS });
const solutionSchema = createSolutionPageSchema({ reviewerKeys: TECHNICAL_REVIEWER_KEYS });

const DOCS_DIR = join(__dirname, '../content/docs');

type MatrixValue = boolean | { value: boolean };
interface MatrixItem {
    label?: { link: string };
    items?: MatrixItem[];
    community?: MatrixValue;
    enterprise?: MatrixValue;
    chartsGrid?: MatrixValue;
}

/** The pricing page's licence features matrix, keyed by docs link, e.g. `./pivoting/`. */
const LICENCE_FEATURES = new Map(
    (gridFeaturesMatrix as Array<{ items: MatrixItem[] }>)
        .flatMap(({ items }) => items.flatMap((item) => item.items ?? [item]))
        .filter((item) => item.label?.link.startsWith('grid:'))
        .map((item) => [item.label!.link.replace(/^grid:/, ''), item])
);
const included = (value?: MatrixValue) => (typeof value === 'object' ? value.value : value === true);

describe('comparison page content', () => {
    test('there is content to check', () => {
        expect(COMPARE_PAGES.length).toBeGreaterThan(0);
    });

    describe.each(COMPARE_PAGES)('$slug', ({ slug, json }) => {
        const result = compareSchema.safeParse(json);

        test('matches the schema, with every competitor claim sourced', () => {
            expect(result.error?.issues ?? []).toEqual([]);
        });

        test('targets its search term in the title, the H1 and the intro', () => {
            const content = result.data as ComparisonPageContent;
            const term = content.meta.targetTerm.toLowerCase();
            const intro = `${content.hero.subHeading} ${content.shortAnswer}`;

            expect(content.meta.title.toLowerCase()).toContain(term);
            expect(content.hero.heading.toLowerCase()).toContain(term);
            expect(intro.toLowerCase()).toContain(term);
        });

        test('is named after the competitor it compares against', () => {
            expect(slug).toBe(`ag-grid-vs-${json.competitor.slug}`);
        });
    });
});

describe('alternative page content', () => {
    test('there is content to check', () => {
        expect(ALTERNATIVE_PAGES.length).toBeGreaterThan(0);
    });

    describe.each(ALTERNATIVE_PAGES)('$slug', ({ slug, json }) => {
        const result = alternativeSchema.safeParse(json);

        test('matches the schema, with every competitor claim sourced', () => {
            expect(result.error?.issues ?? []).toEqual([]);
        });

        test('targets its search term in the title, the H1 and the intro', () => {
            const content = result.data as AlternativePageSource;
            const term = content.meta.targetTerm.toLowerCase();

            expect(content.meta.title.toLowerCase()).toContain(term);
            expect(content.hero.heading.toLowerCase()).toContain(term);
            expect(content.hero.subHeading.toLowerCase()).toContain(term);
        });

        test('is named after the competitor it replaces', () => {
            expect(slug).toBe(`${json.competitor.slug}-alternative`);
        });
    });

    test('each takes its features and pricing from its comparison page', () => {
        const paths = alternativePagePaths({
            comparePages: COMPARE_PAGES.map(({ slug, json }) => ({ id: slug, data: compareSchema.parse(json) })),
            alternativePages: ALTERNATIVE_PAGES.map(({ slug, json }) => ({
                id: slug,
                data: alternativeSchema.parse(json),
            })),
            productAlternativePages: [],
            solutionPages: [],
        });

        expect(paths.map(({ params }) => params.alternativePage)).toEqual(ALTERNATIVE_PAGES.map(({ slug }) => slug));
    });
});

describe('AG Grid alternative page content', () => {
    test('there is exactly one page, served by its own route', () => {
        expect(PRODUCT_ALTERNATIVE_PAGES.map(({ slug }) => slug)).toEqual([PRODUCT_ALTERNATIVE_SLUG]);
    });

    describe.each(PRODUCT_ALTERNATIVE_PAGES)('$slug', ({ json }) => {
        const result = productAlternativeSchema.safeParse(json);
        const content = result.data as ProductAlternativePageContent;

        test('matches the schema', () => {
            expect(result.error?.issues ?? []).toEqual([]);
        });

        test('targets its search term in the title, the H1 and the intro', () => {
            const term = content.meta.targetTerm.toLowerCase();

            expect(content.meta.title.toLowerCase()).toContain(term);
            expect(content.hero.heading.toLowerCase()).toContain(term);
            expect(content.hero.subHeading.toLowerCase()).toContain(term);
        });

        // SE-150: the FAQ answers the People Also Ask questions on AG Grid's pricing.
        test('answers whether AG Grid is free, and whether there is a free alternative', () => {
            expect(content.faq.map(({ question }) => question)).toEqual(
                expect.arrayContaining(['Is AG Grid free?', 'Is there a free alternative to AG Grid?'])
            );
        });

        // SE-150: the page defends AG Grid's own search result, so it never sends readers to a competitor.
        test('links only within the site', () => {
            const links = content.faq.flatMap(({ answer }) =>
                [...answer.matchAll(/\]\(([^)]+)\)/g)].map(([, url]) => url)
            );

            expect(links.length).toBeGreaterThan(0);
            expect(links.filter((url) => !/^\.?\//.test(url))).toEqual([]);
        });

        test('shows each edition as the pricing page licence matrix does', () => {
            const rows = content.editions.groups.flatMap(({ rows }) => rows).filter(({ docsUrl }) => docsUrl);

            for (const { feature, docsUrl, community, enterprise } of rows) {
                const licence = LICENCE_FEATURES.get(docsUrl!);
                expect(licence, `${feature}: ${docsUrl} is not in the licence matrix`).toBeDefined();
                expect(community.status, feature).toBe(included(licence!.community) ? 'yes' : 'no');
                expect(enterprise.plan === 'Enterprise Bundle', feature).toBe(!included(licence!.enterprise));
            }
        });
    });
});

describe('solution page content', () => {
    test('there is content to check', () => {
        expect(SOLUTION_PAGES.length).toBeGreaterThan(0);
    });

    describe.each(SOLUTION_PAGES)('$slug', ({ json }) => {
        const result = solutionSchema.safeParse(json);
        const content = result.data as SolutionPageContent;

        test('matches the schema, with its product claims sourced', () => {
            expect(result.error?.issues ?? []).toEqual([]);
        });

        test('links each capability to a docs page that exists', () => {
            const missing = content.capabilities.items
                .map(({ docsUrl }) => docsUrl?.match(/^\.\/([^/#]+)\//)?.[1])
                .filter((page) => !page || !existsSync(join(DOCS_DIR, page, 'index.mdoc')));

            expect(missing).toEqual([]);
        });

        test('shows each capability in the edition the pricing page licence matrix does', () => {
            for (const { title, docsUrl, plan } of content.capabilities.items) {
                const licence = LICENCE_FEATURES.get(docsUrl!);
                if (licence) {
                    expect(plan, title).toBe(included(licence.community) ? 'Free' : 'Enterprise');
                }
            }
        });
    });
});

describe('decisionRelatedPages', () => {
    const comparison = (slug: string, heading: string) => ({
        slug,
        content: { hero: { heading } } as ComparisonPageContent,
    });
    const alternative = (slug: string, name: string, shortName?: string) => ({
        slug,
        content: { competitor: { name, shortName } } as AlternativePageSource,
    });

    const clusters = {
        comparisons: [
            comparison('ag-grid-vs-tanstack-table', 'AG Grid vs TanStack Table'),
            comparison('ag-grid-vs-syncfusion', 'AG Grid vs Syncfusion'),
            comparison('ag-grid-vs-mui-x', 'AG Grid vs MUI X'),
        ],
        alternatives: [
            alternative('tanstack-table-alternative', 'TanStack Table'),
            alternative('syncfusion-alternative', 'Syncfusion Data Grid', 'Syncfusion'),
        ],
        productAlternatives: [{ slug: 'ag-grid-alternative', content: {} as ProductAlternativePageContent }],
        solutions: [
            { slug: 'tree-grid', content: { topic: { name: 'Tree data' } } as SolutionPageContent },
            {
                slug: 'inventory-management',
                content: { topic: { name: 'Inventory management' } } as SolutionPageContent,
            },
        ],
    };

    test('lists the other comparisons, every alternative and every use case alphabetically, then the AG Grid links', () => {
        const related = decisionRelatedPages({ current: '/compare/ag-grid-vs-tanstack-table/', clusters });

        expect(related.map(({ name }) => name)).toEqual(['Compare', 'Alternatives', 'Use cases', 'AG Grid']);
        expect(related[0].links).toEqual([
            { title: 'AG Grid vs MUI X', url: '/compare/ag-grid-vs-mui-x/' },
            { title: 'AG Grid vs Syncfusion', url: '/compare/ag-grid-vs-syncfusion/' },
        ]);
        expect(related[1].links).toEqual([
            { title: 'AG Grid alternative', url: '/alternatives/ag-grid-alternative/' },
            { title: 'Syncfusion alternative', url: '/alternatives/syncfusion-alternative/' },
            { title: 'TanStack Table alternative', url: '/alternatives/tanstack-table-alternative/' },
        ]);
        expect(related[2].links).toEqual([
            { title: 'Inventory management', url: '/solutions/inventory-management/' },
            { title: 'Tree data', url: '/solutions/tree-grid/' },
        ]);
    });

    test('leaves the current alternative page out of its own links', () => {
        const related = decisionRelatedPages({ current: '/alternatives/syncfusion-alternative/', clusters });

        expect(related[1].links).toEqual([
            { title: 'AG Grid alternative', url: '/alternatives/ag-grid-alternative/' },
            { title: 'TanStack Table alternative', url: '/alternatives/tanstack-table-alternative/' },
        ]);
    });

    test('omits a group with no other pages', () => {
        const related = decisionRelatedPages({
            current: '/compare/ag-grid-vs-tanstack-table/',
            clusters: {
                comparisons: [clusters.comparisons[0]],
                alternatives: [],
                productAlternatives: [],
                solutions: [],
            },
        });

        expect(related.map(({ name }) => name)).toEqual(['AG Grid']);
    });
});

describe('alternativePagePaths', () => {
    const entry = <T>(id: string, data: unknown) => ({ id, data: data as T });
    const comparePage = entry<ComparisonPageContent>('ag-grid-vs-syncfusion', {
        competitor: { slug: 'syncfusion' },
        hero: { heading: 'AG Grid vs Syncfusion' },
        features: {
            groups: [
                { name: 'Platform', rows: [{ feature: 'Frameworks' }] },
                { name: 'Grouping and analysis', rows: [{ feature: 'Row grouping' }, { feature: 'Pivoting' }] },
            ],
        },
        pricing: { subHeading: 'The plans each library offers.' },
    });

    test('takes the named features and the pricing from the comparison with the same competitor, and links to it', () => {
        const [path] = alternativePagePaths({
            comparePages: [comparePage],
            productAlternativePages: [],
            solutionPages: [],
            alternativePages: [
                entry<AlternativePageSource>('syncfusion-alternative', {
                    competitor: { name: 'Syncfusion Data Grid', slug: 'syncfusion' },
                    features: ['Pivoting'],
                }),
            ],
        });

        expect(path.params.alternativePage).toBe('syncfusion-alternative');
        expect(path.props.content.features.groups).toEqual([
            { name: 'Grouping and analysis', rows: [{ feature: 'Pivoting' }] },
        ]);
        expect(path.props.content.pricing).toBe(comparePage.data.pricing);
        expect(path.props.comparison).toEqual({
            title: 'AG Grid vs Syncfusion',
            url: '/compare/ag-grid-vs-syncfusion/',
        });
    });

    test('fails the build for an alternative page with no comparison page', () => {
        expect(() =>
            alternativePagePaths({
                comparePages: [comparePage],
                productAlternativePages: [],
                solutionPages: [],
                alternativePages: [
                    entry<AlternativePageSource>('handsontable-alternative', {
                        competitor: { name: 'Handsontable', slug: 'handsontable' },
                        features: ['Pivoting'],
                    }),
                ],
            })
        ).toThrow('alternatives/handsontable-alternative has no comparison page');
    });
});
