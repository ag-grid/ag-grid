import { getFrameworkVersionLinks } from './frameworkVersionLinks';

describe('getFrameworkVersionLinks', () => {
    test('links the other three frameworks when the page has no framework restriction', () => {
        expect(getFrameworkVersionLinks({ path: '/react-data-grid/filtering/', currentFramework: 'react' })).toEqual([
            { framework: 'angular', label: 'Angular Data Grid', href: '/angular-data-grid/filtering/' },
            { framework: 'vue', label: 'Vue Data Grid', href: '/vue-data-grid/filtering/' },
            { framework: 'javascript', label: 'JavaScript Data Grid', href: '/javascript-data-grid/filtering/' },
        ]);
    });

    test('links only the other frameworks the page exists in', () => {
        const links = getFrameworkVersionLinks({
            path: '/react-data-grid/page/',
            currentFramework: 'react',
            pageFrameworks: ['react', 'vue'],
        });

        expect(links.map((l) => l.framework)).toEqual(['vue']);
    });

    test('links nothing when the page exists only in the current framework', () => {
        expect(
            getFrameworkVersionLinks({
                path: '/react-data-grid/react-hooks/',
                currentFramework: 'react',
                pageFrameworks: ['react'],
            })
        ).toEqual([]);
    });
});
