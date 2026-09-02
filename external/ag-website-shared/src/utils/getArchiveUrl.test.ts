import { getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';

describe('getDocumentationArchiveUrl', () => {
    // Archive pages are directory indexes, so a slash-less url only reaches them via a 301.
    test.each`
        version     | path                                 | expected
        ${'30.0.0'} | ${undefined}                         | ${'https://www.ag-grid.com/archive/30.0.0/documentation/'}
        ${'26.0.0'} | ${undefined}                         | ${'https://www.ag-grid.com/archive/26.0.0/'}
        ${'30.0.0'} | ${'/gallery/bar-series'}             | ${'https://www.ag-grid.com/archive/30.0.0/gallery/bar-series/'}
        ${'30.0.0'} | ${'/javascript-data-grid/side-bar/'} | ${'https://www.ag-grid.com/archive/30.0.0/javascript-data-grid/side-bar/'}
    `('returns $expected for version $version and path $path', ({ version, path, expected }) => {
        expect(getDocumentationArchiveUrl({ site: 'grid', version, path })).toBe(expected);
    });

    test('leaves an anchored url alone, as the anchor already terminates the path', () => {
        expect(
            getDocumentationArchiveUrl({
                site: 'grid',
                version: '30.0.0',
                path: '/javascript-data-grid/side-bar/#example-basic',
            })
        ).toBe('https://www.ag-grid.com/archive/30.0.0/javascript-data-grid/side-bar/#example-basic');
    });
});
