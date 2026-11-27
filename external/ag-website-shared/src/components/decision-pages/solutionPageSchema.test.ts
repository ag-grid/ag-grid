import { createSolutionPageSchema } from './solutionPageSchema';

function validPage() {
    return {
        meta: {
            title: 'Inventory Management Dashboard Grid | AG Grid',
            description: 'Build an inventory management dashboard with AG Grid.',
            targetTerm: 'inventory management dashboard',
        },
        analyticsPrefix: 'solution-inventory-management',
        technicalReviewer: 'james',
        lastUpdated: '2026-11-24',
        topic: { name: 'Inventory management', mark: 'Inventory management' },
        hero: { heading: 'Build an inventory management dashboard with AG Grid', subHeading: 'Edit stock in place.' },
        shortAnswer: 'AG Grid shows stock levels in one editable table.',
        example: { id: 'inventory', intro: 'Edit a stock level.', note: 'Sample data.' },
        keyFigures: {
            heading: 'Key figures',
            figures: [{ value: '100k+', label: 'Rows', detail: 'In the Client-Side Row Model.' }],
        },
        capabilities: {
            heading: 'Capabilities',
            items: [{ title: 'Cell editing', docsUrl: './cell-editing/', plan: 'Free', body: 'Edit cells in place.' }],
        },
        howTo: {
            heading: 'How to build it',
            steps: [{ title: 'Make stock editable', body: 'Set `editable` on the column.' }],
            code: 'const columnDefs = [{ field: "stock", editable: true }];',
            outro: 'See the [inventory demo](/example-inventory/).',
        },
        faq: [{ question: 'Is AG Grid free?', answer: 'Yes.' }],
        proseClaims: [
            {
                claim: 'The Client-Side Row Model handles 100k+ rows.',
                sourceUrl: 'https://www.ag-grid.com/react-data-grid/row-models/',
                checkedOn: '2026-11-24',
            },
        ],
    };
}

const schema = createSolutionPageSchema({ reviewerKeys: ['james'], now: new Date('2026-11-24') });

describe('createSolutionPageSchema', () => {
    test('accepts a page with its example, capabilities, how-to and sourced claims', () => {
        expect(schema.safeParse(validPage()).error?.issues ?? []).toEqual([]);
    });

    test('rejects a page that sources none of its claims', () => {
        const result = schema.safeParse({ ...validPage(), proseClaims: [] });

        expect(result.error?.issues.map(({ path }) => path.join('.'))).toEqual(['proseClaims']);
    });
});
