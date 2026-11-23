import { createAlternativePageSchema } from '@ag-website-shared/components/decision-pages/alternativePageSchema';
import { createComparisonPageSchema } from '@ag-website-shared/components/decision-pages/comparisonPageSchema';
import type { AlternativePageContent, ComparisonPageContent } from '@ag-website-shared/components/decision-pages/types';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { alternativePagePaths, decisionRelatedPages } from './decisionPages';
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

const compareSchema = createComparisonPageSchema({ reviewerKeys: TECHNICAL_REVIEWER_KEYS });
const alternativeSchema = createAlternativePageSchema({ reviewerKeys: TECHNICAL_REVIEWER_KEYS });

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

        // The intro is about AG Grid rather than the competitor, so the term is checked where the
        // page names what it replaces.
        test('targets its search term in the title and the H1', () => {
            const content = result.data as AlternativePageContent;
            const term = content.meta.targetTerm.toLowerCase();

            expect(content.meta.title.toLowerCase()).toContain(term);
            expect(content.hero.heading.toLowerCase()).toContain(term);
        });

        test('is named after the competitor it replaces', () => {
            expect(slug).toBe(`${json.competitor.slug}-alternative`);
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
        content: { competitor: { name, shortName } } as AlternativePageContent,
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
    };

    test('lists the other comparisons and every alternative alphabetically, then the AG Grid links', () => {
        const related = decisionRelatedPages({ current: '/compare/ag-grid-vs-tanstack-table/', clusters });

        expect(related.map(({ name }) => name)).toEqual(['Compare', 'Alternatives', 'AG Grid']);
        expect(related[0].links).toEqual([
            { title: 'AG Grid vs MUI X', url: '/compare/ag-grid-vs-mui-x/' },
            { title: 'AG Grid vs Syncfusion', url: '/compare/ag-grid-vs-syncfusion/' },
        ]);
        expect(related[1].links).toEqual([
            { title: 'Syncfusion alternative', url: '/alternatives/syncfusion-alternative/' },
            { title: 'TanStack Table alternative', url: '/alternatives/tanstack-table-alternative/' },
        ]);
    });

    test('leaves the current alternative page out of its own links', () => {
        const related = decisionRelatedPages({ current: '/alternatives/syncfusion-alternative/', clusters });

        expect(related[1].links).toEqual([
            { title: 'TanStack Table alternative', url: '/alternatives/tanstack-table-alternative/' },
        ]);
    });

    test('omits a group with no other pages', () => {
        const related = decisionRelatedPages({
            current: '/compare/ag-grid-vs-tanstack-table/',
            clusters: { comparisons: [clusters.comparisons[0]], alternatives: [] },
        });

        expect(related.map(({ name }) => name)).toEqual(['AG Grid']);
    });
});

describe('alternativePagePaths', () => {
    const entry = <T>(id: string, data: unknown) => ({ id, data: data as T });

    test('links each alternative page to the comparison with the same competitor, when there is one', () => {
        const paths = alternativePagePaths({
            comparePages: [
                entry<ComparisonPageContent>('ag-grid-vs-syncfusion', {
                    competitor: { slug: 'syncfusion' },
                    hero: { heading: 'AG Grid vs Syncfusion' },
                }),
            ],
            alternativePages: [
                entry<AlternativePageContent>('syncfusion-alternative', {
                    competitor: { name: 'Syncfusion Data Grid', slug: 'syncfusion' },
                }),
                entry<AlternativePageContent>('handsontable-alternative', {
                    competitor: { name: 'Handsontable', slug: 'handsontable' },
                }),
            ],
        });

        expect(paths.map(({ params, props }) => [params.alternativePage, props.comparison])).toEqual([
            ['syncfusion-alternative', { title: 'AG Grid vs Syncfusion', url: '/compare/ag-grid-vs-syncfusion/' }],
            ['handsontable-alternative', undefined],
        ]);
    });
});
