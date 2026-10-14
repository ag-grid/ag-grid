import type { MenuItem } from '@ag-grid-types';

import { getFrameworkVersionLinks, isPageInFramework } from './frameworkVersionLinks';

describe('getFrameworkVersionLinks', () => {
    test('links the other three frameworks when there are no menu items to check against', () => {
        expect(getFrameworkVersionLinks({ path: '/react-data-grid/filtering/', currentFramework: 'react' })).toEqual([
            { framework: 'angular', label: 'Angular Data Grid', href: '/angular-data-grid/filtering/' },
            { framework: 'vue', label: 'Vue Data Grid', href: '/vue-data-grid/filtering/' },
            { framework: 'javascript', label: 'JavaScript Data Grid', href: '/javascript-data-grid/filtering/' },
        ]);
    });

    test('links the other three frameworks when the page has no framework restriction', () => {
        const menuItems: MenuItem[] = [{ title: 'Filtering', path: 'filtering' }];

        const links = getFrameworkVersionLinks({
            path: '/vue-data-grid/filtering/',
            currentFramework: 'vue',
            menuItems,
        });

        expect(links.map((l) => l.framework)).toEqual(['react', 'angular', 'javascript']);
        expect(links.map((l) => l.href)).toEqual([
            '/react-data-grid/filtering/',
            '/angular-data-grid/filtering/',
            '/javascript-data-grid/filtering/',
        ]);
    });

    test('skips frameworks the page does not exist in', () => {
        const menuItems: MenuItem[] = [
            { title: 'Parent', path: 'parent', children: [{ title: 'Hooks', path: 'hooks', frameworks: ['react'] }] },
        ];

        expect(
            getFrameworkVersionLinks({ path: '/react-data-grid/hooks/', currentFramework: 'react', menuItems })
        ).toEqual([]);
    });

    test('links only the frameworks the page exists in', () => {
        const menuItems: MenuItem[] = [{ title: 'Page', path: 'page', frameworks: ['react', 'vue'] }];

        const links = getFrameworkVersionLinks({
            path: '/react-data-grid/page/',
            currentFramework: 'react',
            menuItems,
        });

        expect(links.map((l) => l.framework)).toEqual(['vue']);
    });
});

describe('isPageInFramework', () => {
    test.each([
        { menuItem: undefined, framework: 'angular', expected: true },
        { menuItem: { title: 'A', path: 'a' }, framework: 'angular', expected: true },
        { menuItem: { title: 'A', path: 'a', frameworks: ['react'] }, framework: 'angular', expected: false },
        { menuItem: { title: 'A', path: 'a', frameworks: ['react'] }, framework: 'react', expected: true },
    ] as const)('$framework in $menuItem -> $expected', ({ menuItem, framework, expected }) => {
        expect(isPageInFramework(menuItem as MenuItem | undefined, framework)).toBe(expected);
    });
});
