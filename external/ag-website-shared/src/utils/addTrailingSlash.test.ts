import { addTrailingSlash, addTrailingSlashToPath } from '@ag-website-shared/utils/addTrailingSlash';

describe('addTrailingSlash', () => {
    test.each`
        url                      | expected
        ${'docs'}                | ${'docs/'}
        ${'docs/'}               | ${'docs/'}
        ${'./docs'}              | ${'./docs/'}
        ${'./docs/path'}         | ${'./docs/path/'}
        ${'/gallery'}            | ${'/gallery/'}
        ${'/gallery/'}           | ${'/gallery/'}
        ${'/docs#section'}       | ${'/docs#section'}
        ${'https://youtube.com'} | ${'https://youtube.com'}
    `('$url -> $expected', ({ url, expected }) => {
        expect(addTrailingSlash(url)).toBe(expected);
    });
});

describe('addTrailingSlashToPath', () => {
    // The slash goes into the pathname, never after the query string or fragment, and urls with no
    // pathname or with a file extension are left alone.
    test.each`
        url                                                 | expected
        ${'docs'}                                           | ${'docs/'}
        ${'docs/'}                                          | ${'docs/'}
        ${'./docs'}                                         | ${'./docs/'}
        ${'./docs/path'}                                    | ${'./docs/path/'}
        ${'/gallery'}                                       | ${'/gallery/'}
        ${'/gallery/'}                                      | ${'/gallery/'}
        ${'/react-data-grid/example?theme=quartz'}          | ${'/react-data-grid/example/?theme=quartz'}
        ${'/react-data-grid/page#section'}                  | ${'/react-data-grid/page/#section'}
        ${'/charts/gallery?utm_source=x'}                   | ${'/charts/gallery/?utm_source=x'}
        ${'/archive/36.0.0/gallery?series=bar'}             | ${'/archive/36.0.0/gallery/?series=bar'}
        ${'/archive/26.0.0'}                                | ${'/archive/26.0.0/'}
        ${'/react-data-grid/page/#section'}                 | ${'/react-data-grid/page/#section'}
        ${'/react-data-grid/page/?a=1#section'}             | ${'/react-data-grid/page/?a=1#section'}
        ${'#section'}                                       | ${'#section'}
        ${'?x=1'}                                           | ${'?x=1'}
        ${''}                                               | ${''}
        ${'/react-data-grid/guide.pdf'}                     | ${'/react-data-grid/guide.pdf'}
        ${'./example.json'}                                 | ${'./example.json'}
        ${'/react-data-grid/guide.pdf?download=1'}          | ${'/react-data-grid/guide.pdf?download=1'}
        ${'https://www.ag-grid.com/charts/themes#palette'}  | ${'https://www.ag-grid.com/charts/themes/#palette'}
        ${'https://www.ag-grid.com/react-data-grid/themes'} | ${'https://www.ag-grid.com/react-data-grid/themes/'}
    `('$url -> $expected', ({ url, expected }) => {
        expect(addTrailingSlashToPath(url)).toBe(expected);
    });
});
