import type { MenuItem } from '@ag-grid-types';

import { type RelatedLinkOverride, getDocsRelatedLinks } from './docsRelatedLinks';

const SITE_ROOT = 'https://www.ag-grid.com/';

// A cut-down nav with the shapes that matter: a section with direct items, a nested group, an
// item restricted to some frameworks, a group heading with no destination, and an external link.
const DOCS_NAV: MenuItem[] = [
    {
        title: 'Core Features',
        children: [
            { title: 'Cells', path: 'cell-content' },
            {
                title: 'Editing',
                children: [
                    { title: 'Cell Editing', path: 'cell-editing' },
                    { title: 'Cell Editors', path: 'cell-editors' },
                    { title: 'Cell Data Types', path: 'cell-data-types' },
                    { title: 'React Editors', path: 'react-editors', frameworks: ['react'] },
                    { title: 'Editing Reference' },
                ],
            },
        ],
    },
];

const API_NAV: MenuItem[] = [
    {
        title: 'Grid',
        children: [
            { title: 'Options Reference', path: 'grid-options' },
            { title: 'Events Reference', path: 'grid-events' },
            { title: 'GitHub', url: 'https://github.com/ag-grid/ag-grid' },
        ],
    },
];

const relatedFor = (pageName: string, framework: 'react' | 'angular' = 'angular', overrides?: RelatedLinkOverride[]) =>
    getDocsRelatedLinks({
        navSections: [DOCS_NAV, API_NAV],
        pageName,
        framework,
        siteRoot: SITE_ROOT,
        overrides,
    });

describe('getDocsRelatedLinks', () => {
    test("returns the page's nav-group siblings, in nav order, as absolute URLs", () => {
        expect(relatedFor('cell-editing')).toEqual([
            { title: 'Cell Editors', url: 'https://www.ag-grid.com/angular-data-grid/cell-editors/' },
            { title: 'Cell Data Types', url: 'https://www.ag-grid.com/angular-data-grid/cell-data-types/' },
        ]);
    });

    test('resolves the URLs for the framework the twin was rendered for', () => {
        expect(relatedFor('cell-editing', 'react').map(({ url }) => url)).toEqual([
            'https://www.ag-grid.com/react-data-grid/cell-editors/',
            'https://www.ag-grid.com/react-data-grid/cell-data-types/',
            'https://www.ag-grid.com/react-data-grid/react-editors/',
        ]);
    });

    test('drops the page itself, headings with no destination, and other frameworks-only pages', () => {
        const titles = relatedFor('cell-editing').map(({ title }) => title);

        expect(titles).not.toContain('Cell Editing');
        expect(titles).not.toContain('Editing Reference');
        expect(titles).not.toContain('React Editors');
    });

    test("uses a section's direct items when the page is not inside a group", () => {
        // `cell-content` sits directly under Core Features, alongside the Editing group heading,
        // which is not a destination — so there is nothing else to offer.
        expect(relatedFor('cell-content')).toEqual([]);
    });

    test('falls back to the API nav for a page the docs nav does not list', () => {
        expect(relatedFor('grid-options')).toEqual([
            { title: 'Events Reference', url: 'https://www.ag-grid.com/angular-data-grid/grid-events/' },
            { title: 'GitHub', url: 'https://github.com/ag-grid/ag-grid' },
        ]);
    });

    test('returns nothing for a page in neither nav, rather than a fabricated list', () => {
        expect(relatedFor('some-standalone-page')).toEqual([]);
    });

    describe('frontmatter overrides', () => {
        test('replaces the derived list, titling page names from the nav', () => {
            expect(relatedFor('cell-editing', 'angular', ['grid-options', 'cell-content'])).toEqual([
                { title: 'Options Reference', url: 'https://www.ag-grid.com/angular-data-grid/grid-options/' },
                { title: 'Cells', url: 'https://www.ag-grid.com/angular-data-grid/cell-content/' },
            ]);
        });

        test('titles a page the nav does not list from its slug', () => {
            expect(relatedFor('cell-editing', 'angular', ['server-side-model-tree-data'])).toEqual([
                {
                    title: 'Server Side Model Tree Data',
                    url: 'https://www.ag-grid.com/angular-data-grid/server-side-model-tree-data/',
                },
            ]);
        });

        test('takes an explicit title and URL for anything off the docs tree', () => {
            expect(
                relatedFor('cell-editing', 'angular', [{ title: 'Licence & Pricing', url: '/license-pricing/' }])
            ).toEqual([{ title: 'Licence & Pricing', url: 'https://www.ag-grid.com/license-pricing/' }]);
        });

        test('an empty override list leaves the derived links in place', () => {
            expect(relatedFor('cell-editing', 'angular', [])).toHaveLength(2);
        });
    });
});
