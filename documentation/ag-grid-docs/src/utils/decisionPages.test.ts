import { createComparisonPageSchema } from '@ag-website-shared/components/decision-pages/comparisonPageSchema';
import type { ComparisonPageContent } from '@ag-website-shared/components/decision-pages/types';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { compareRelatedPages } from './decisionPages';
import { TECHNICAL_REVIEWER_KEYS } from './technicalReviewers';

const COMPARE_CONTENT_DIR = join(__dirname, '../content/compare');

const COMPARE_PAGES = readdirSync(COMPARE_CONTENT_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
        slug: file.replace(/\.json$/, ''),
        json: JSON.parse(readFileSync(join(COMPARE_CONTENT_DIR, file), 'utf8')),
    }));

const schema = createComparisonPageSchema({ reviewerKeys: TECHNICAL_REVIEWER_KEYS });

describe('comparison page content', () => {
    test('there is content to check', () => {
        expect(COMPARE_PAGES.length).toBeGreaterThan(0);
    });

    describe.each(COMPARE_PAGES)('$slug', ({ slug, json }) => {
        const result = schema.safeParse(json);

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

describe('compareRelatedPages', () => {
    const page = (slug: string, heading: string) => ({
        slug,
        content: { hero: { heading } } as ComparisonPageContent,
    });

    test('lists the other comparisons alphabetically, then the AG Grid links', () => {
        const related = compareRelatedPages({
            slug: 'ag-grid-vs-tanstack-table',
            pages: [
                page('ag-grid-vs-tanstack-table', 'AG Grid vs TanStack Table'),
                page('ag-grid-vs-syncfusion', 'AG Grid vs Syncfusion'),
                page('ag-grid-vs-mui-x', 'AG Grid vs MUI X'),
            ],
        });

        expect(related.map(({ name }) => name)).toEqual(['Compare', 'AG Grid']);
        expect(related[0].links).toEqual([
            { title: 'AG Grid vs MUI X', url: '/compare/ag-grid-vs-mui-x/' },
            { title: 'AG Grid vs Syncfusion', url: '/compare/ag-grid-vs-syncfusion/' },
        ]);
    });

    test('omits the comparison group when the page is the only comparison', () => {
        const related = compareRelatedPages({
            slug: 'ag-grid-vs-tanstack-table',
            pages: [page('ag-grid-vs-tanstack-table', 'AG Grid vs TanStack Table')],
        });

        expect(related.map(({ name }) => name)).toEqual(['AG Grid']);
    });
});
