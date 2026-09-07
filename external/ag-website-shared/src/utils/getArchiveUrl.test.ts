import { getArchiveUrl, getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';

describe('getArchiveUrl', () => {
    test('links to the version archive as a directory index', () => {
        expect(getArchiveUrl({ site: 'grid', version: '36.0.0' })).toBe('https://www.ag-grid.com/archive/36.0.0/');
    });
});

describe('getDocumentationArchiveUrl', () => {
    // Archive pages are directory indexes, so a slash-less url only reaches them via a 301. The bare
    // version url (grid < 27.3.0, no `/documentation`) also proves the builder routes through
    // `addTrailingSlashToPath`, whose file check must not mistake `26.0.0` for a file extension.
    test.each`
        version     | path                                              | expected
        ${'30.0.0'} | ${undefined}                                      | ${'https://www.ag-grid.com/archive/30.0.0/documentation/'}
        ${'26.0.0'} | ${undefined}                                      | ${'https://www.ag-grid.com/archive/26.0.0/'}
        ${'30.0.0'} | ${'/gallery/bar-series'}                          | ${'https://www.ag-grid.com/archive/30.0.0/gallery/bar-series/'}
        ${'30.0.0'} | ${'/javascript-data-grid/side-bar/'}              | ${'https://www.ag-grid.com/archive/30.0.0/javascript-data-grid/side-bar/'}
        ${'36.0.0'} | ${'/gallery?series=bar'}                          | ${'https://www.ag-grid.com/archive/36.0.0/gallery/?series=bar'}
        ${'36.0.0'} | ${'/javascript-data-grid/side-bar#example-basic'} | ${'https://www.ag-grid.com/archive/36.0.0/javascript-data-grid/side-bar/#example-basic'}
        ${'36.0.0'} | ${'/javascript-data-grid/guide.pdf'}              | ${'https://www.ag-grid.com/archive/36.0.0/javascript-data-grid/guide.pdf'}
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
