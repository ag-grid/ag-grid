import type { MenuItem } from '@ag-grid-types';

import { navPageNames, navSectionsToIndex } from './docsNavIndex';

const SITE_ROOT = 'https://www.ag-grid.com/';

const NAV: MenuItem[] = [
    {
        title: 'Getting Started',
        children: [
            { title: 'Quick Start', path: 'getting-started' },
            {
                title: 'Setup',
                children: [
                    { title: 'Installation', path: 'installation' },
                    { title: 'React Only', path: 'react-setup', frameworks: ['react'] },
                ],
            },
            { title: 'Reference Only' },
        ],
    },
    {
        title: 'Charting',
        children: [{ title: 'GitHub', url: 'https://github.com/ag-grid/ag-grid' }],
    },
];

describe('navSectionsToIndex', () => {
    const index = navSectionsToIndex({ sections: NAV, framework: 'javascript', siteRoot: SITE_ROOT });

    test('emits one group per nav group, named by its full path, in nav order', () => {
        expect(index.map(({ title }) => title)).toEqual(['Getting Started', 'Getting Started > Setup', 'Charting']);
    });

    test('resolves docs pages to absolute URLs for the given framework', () => {
        expect(index[0].links).toEqual([
            { title: 'Quick Start', url: 'https://www.ag-grid.com/javascript-data-grid/getting-started/' },
        ]);
        expect(index[1].links).toEqual([
            { title: 'Installation', url: 'https://www.ag-grid.com/javascript-data-grid/installation/' },
        ]);
    });

    test('drops pages the framework does not have, and headings that point nowhere', () => {
        const titles = index.flatMap(({ links }) => links.map((link) => link.title));

        expect(titles).not.toContain('React Only');
        expect(titles).not.toContain('Reference Only');
        expect(navSectionsToIndex({ sections: NAV, framework: 'react', siteRoot: SITE_ROOT })[1].links).toHaveLength(2);
    });

    test('passes whole `url` items through unchanged', () => {
        expect(index[2].links).toEqual([{ title: 'GitHub', url: 'https://github.com/ag-grid/ag-grid' }]);
    });

    test('drops an untitled nav level from the heading, as the API nav opens with one', () => {
        // The API nav's first section is `hideTitle` with no title at all, holding the
        // reference landing page.
        const untitled = [{ children: [{ title: 'AG Grid: Reference', path: 'reference' }] }] as MenuItem[];

        expect(
            navSectionsToIndex({ sections: untitled, framework: 'javascript', titlePrefix: 'Reference' })[0].title
        ).toBe('Reference');
    });

    test('prefixes the group names when the nav needs naming from outside', () => {
        const prefixed = navSectionsToIndex({
            sections: NAV,
            framework: 'javascript',
            siteRoot: SITE_ROOT,
            titlePrefix: 'Reference',
        });

        expect(prefixed.map(({ title }) => title)).toEqual([
            'Reference > Getting Started',
            'Reference > Getting Started > Setup',
            'Reference > Charting',
        ]);
    });
});

describe('navPageNames', () => {
    test('collects every page the nav reaches, at any depth', () => {
        expect(navPageNames(NAV)).toEqual(new Set(['getting-started', 'installation', 'react-setup']));
    });

    test('includes childPaths, which are pages the nav owns without listing separately', () => {
        const withChildPaths: MenuItem[] = [
            { title: 'Theming', path: 'theming', childPaths: ['theming-api', 'theming-parts'] },
        ];

        expect(navPageNames(withChildPaths)).toEqual(new Set(['theming', 'theming-api', 'theming-parts']));
    });
});
