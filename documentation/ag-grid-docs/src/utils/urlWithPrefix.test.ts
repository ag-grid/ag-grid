import { urlWithPrefix } from './urlWithPrefix';

describe('urlWithPrefix', () => {
    test.each`
        url                           | framework       | expected
        ${'./'}                       | ${'javascript'} | ${'/ag-charts/javascript-data-grid/'}
        ${'./docs'}                   | ${'javascript'} | ${'/ag-charts/javascript-data-grid/docs/'}
        ${'./with-slash/'}            | ${'javascript'} | ${'/ag-charts/javascript-data-grid/with-slash/'}
        ${'./docs'}                   | ${'react'}      | ${'/ag-charts/react-data-grid/docs/'}
        ${'./docs/path'}              | ${'react'}      | ${'/ag-charts/react-data-grid/docs/path/'}
        ${'/gallery'}                 | ${'react'}      | ${'/ag-charts/gallery/'}
        ${'/'}                        | ${'javascript'} | ${'/ag-charts/'}
        ${'/with-slash/'}             | ${'javascript'} | ${'/ag-charts/with-slash/'}
        ${'https://youtube.com'}      | ${'react'}      | ${'https://youtube.com'}
        ${'https://www.ag-grid.com/'} | ${'react'}      | ${'https://www.ag-grid.com/'}
        ${'./someImage.png'}          | ${'javascript'} | ${'/ag-charts/javascript-data-grid/someImage.png'}
        ${'/someImage.png'}           | ${'javascript'} | ${'/ag-charts/someImage.png'}
        ${'/?urlParams=something'}    | ${'javascript'} | ${'/ag-charts/?urlParams=something'}
    `('returns $expected for url $url, framework $framework siteBaseUrl /ag-charts', ({ url, framework, expected }) => {
        const siteBaseUrl = '/ag-charts';
        expect(urlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
    });

    test.each`
        url                           | framework       | expected
        ${'./'}                       | ${'javascript'} | ${'/ag-charts/javascript-data-grid/'}
        ${'./docs'}                   | ${'javascript'} | ${'/ag-charts/javascript-data-grid/docs'}
        ${'./with-slash/'}            | ${'javascript'} | ${'/ag-charts/javascript-data-grid/with-slash/'}
        ${'https://www.ag-grid.com/'} | ${'react'}      | ${'https://www.ag-grid.com/'}
        ${'./docs'}                   | ${'react'}      | ${'/ag-charts/react-data-grid/docs'}
        ${'./docs/path'}              | ${'react'}      | ${'/ag-charts/react-data-grid/docs/path'}
        ${'/gallery'}                 | ${'react'}      | ${'/ag-charts/gallery'}
        ${'/'}                        | ${'javascript'} | ${'/ag-charts/'}
        ${'/with-slash/'}             | ${'javascript'} | ${'/ag-charts/with-slash/'}
        ${'./someImage.png'}          | ${'javascript'} | ${'/ag-charts/javascript-data-grid/someImage.png'}
        ${'/someImage.png'}           | ${'javascript'} | ${'/ag-charts/someImage.png'}
        ${'/?urlParams=something'}    | ${'javascript'} | ${'/ag-charts/?urlParams=something'}
    `(
        'returns without trailing slash in $expected for url $url, framework $framework siteBaseUrl /ag-charts',
        ({ url, framework, expected }) => {
            const siteBaseUrl = '/ag-charts';
            expect(urlWithPrefix({ url, framework, siteBaseUrl, trailingSlash: false })).toBe(expected);
        }
    );

    test.each`
        url                           | framework       | expected
        ${'https://youtube.com'}      | ${'javascript'} | ${'https://youtube.com'}
        ${'https://www.ag-grid.com/'} | ${'react'}      | ${'https://www.ag-grid.com/'}
        ${'./docs/path#some-hash'}    | ${'javascript'} | ${'/ag-charts/javascript-data-grid/docs/path#some-hash'}
        ${'/?urlParams=something'}    | ${'javascript'} | ${'/ag-charts/?urlParams=something'}
    `(
        '$expected ignores trailing slash config for url $url, framework $framework siteBaseUrl /ag-charts',
        ({ url, framework, expected }) => {
            const siteBaseUrl = '/ag-charts';
            expect(urlWithPrefix({ url, framework, siteBaseUrl, trailingSlash: true })).toBe(expected);
        }
    );

    test.each`
        url                           | framework       | expected
        ${'./'}                       | ${'javascript'} | ${'/ag-charts/javascript-data-grid/'}
        ${'./docs'}                   | ${'javascript'} | ${'/ag-charts/javascript-data-grid/docs/'}
        ${'./with-slash/'}            | ${'javascript'} | ${'/ag-charts/javascript-data-grid/with-slash/'}
        ${'./docs'}                   | ${'react'}      | ${'/ag-charts/react-data-grid/docs/'}
        ${'./docs/path'}              | ${'react'}      | ${'/ag-charts/react-data-grid/docs/path/'}
        ${'/gallery'}                 | ${'react'}      | ${'/ag-charts/gallery/'}
        ${'/'}                        | ${'javascript'} | ${'/ag-charts/'}
        ${'/with-slash/'}             | ${'javascript'} | ${'/ag-charts/with-slash/'}
        ${'https://youtube.com'}      | ${'react'}      | ${'https://youtube.com'}
        ${'https://www.ag-grid.com/'} | ${'react'}      | ${'https://www.ag-grid.com/'}
        ${'./someImage.png'}          | ${'javascript'} | ${'/ag-charts/javascript-data-grid/someImage.png'}
        ${'/someImage.png'}           | ${'javascript'} | ${'/ag-charts/someImage.png'}
        ${'/?urlParams=something'}    | ${'javascript'} | ${'/ag-charts/?urlParams=something'}
    `('$url (/ag-charts/ siteBaseUrl), framework $framework -> $expected', ({ url, framework, expected }) => {
        const siteBaseUrl = '/ag-charts/';
        expect(urlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
    });

    test.each`
        url                           | framework       | expected
        ${'./'}                       | ${'javascript'} | ${'/javascript-data-grid/'}
        ${'./docs'}                   | ${'javascript'} | ${'/javascript-data-grid/docs/'}
        ${'./with-slash/'}            | ${'javascript'} | ${'/javascript-data-grid/with-slash/'}
        ${'./docs'}                   | ${'react'}      | ${'/react-data-grid/docs/'}
        ${'./docs/path'}              | ${'react'}      | ${'/react-data-grid/docs/path/'}
        ${'/gallery'}                 | ${'react'}      | ${'/gallery/'}
        ${'/'}                        | ${'javascript'} | ${'/'}
        ${'/with-slash/'}             | ${'javascript'} | ${'/with-slash/'}
        ${'https://youtube.com'}      | ${'react'}      | ${'https://youtube.com'}
        ${'https://www.ag-grid.com/'} | ${'react'}      | ${'https://www.ag-grid.com/'}
        ${'./someImage.png'}          | ${'javascript'} | ${'/javascript-data-grid/someImage.png'}
        ${'/someImage.png'}           | ${'javascript'} | ${'/someImage.png'}
        ${'/?urlParams=something'}    | ${'javascript'} | ${'/?urlParams=something'}
    `('$url (empty siteBaseUrl), framework $framework -> $expected', ({ url, framework, expected }) => {
        const siteBaseUrl = '';
        expect(urlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
    });

    test.each`
        url                           | framework       | expected
        ${'./'}                       | ${'javascript'} | ${'/javascript-data-grid/'}
        ${'./docs'}                   | ${'javascript'} | ${'/javascript-data-grid/docs/'}
        ${'./with-slash/'}            | ${'javascript'} | ${'/javascript-data-grid/with-slash/'}
        ${'./docs'}                   | ${'react'}      | ${'/react-data-grid/docs/'}
        ${'./docs/path'}              | ${'react'}      | ${'/react-data-grid/docs/path/'}
        ${'/gallery'}                 | ${'react'}      | ${'/gallery/'}
        ${'/'}                        | ${'javascript'} | ${'/'}
        ${'/with-slash/'}             | ${'javascript'} | ${'/with-slash/'}
        ${'https://youtube.com'}      | ${'react'}      | ${'https://youtube.com'}
        ${'https://www.ag-grid.com/'} | ${'react'}      | ${'https://www.ag-grid.com/'}
        ${'./someImage.png'}          | ${'javascript'} | ${'/javascript-data-grid/someImage.png'}
        ${'/someImage.png'}           | ${'javascript'} | ${'/someImage.png'}
        ${'/?urlParams=something'}    | ${'javascript'} | ${'/?urlParams=something'}
    `('$url (/ siteBaseUrl), framework $framework -> $expected', ({ url, framework, expected }) => {
        const siteBaseUrl = '/';
        expect(urlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
    });

    test('warns for invalid links', () => {
        const prefixInvalidUrl = () =>
            urlWithPrefix({ url: '../unhandled-link-type', framework: 'javascript', siteBaseUrl: '' });
        expect(prefixInvalidUrl).toThrowError();
    });
});
