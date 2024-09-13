import { urlWithPrefix } from './urlWithPrefix';

describe('urlWithPrefix', () => {
    test.each`
        url                      | framework       | expected
        ${'./docs'}              | ${'javascript'} | ${'/ag-charts/javascript-data-grid/docs'}
        ${'./docs'}              | ${'react'}      | ${'/ag-charts/react-data-grid/docs'}
        ${'./docs/path'}         | ${'react'}      | ${'/ag-charts/react-data-grid/docs/path'}
        ${'/gallery'}            | ${'react'}      | ${'/ag-charts/gallery'}
        ${'https://youtube.com'} | ${'react'}      | ${'https://youtube.com'}
    `(
        'returns "$expected" for url $url, framework $framework siteBaseUrl /ag-charts',
        ({ url, framework, expected }) => {
            const siteBaseUrl = '/ag-charts';
            expect(urlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
        }
    );

    test.each`
        url                      | framework       | expected
        ${'./docs'}              | ${'javascript'} | ${'/ag-charts/javascript-data-grid/docs/'}
        ${'./docs'}              | ${'react'}      | ${'/ag-charts/react-data-grid/docs/'}
        ${'./docs/path'}         | ${'react'}      | ${'/ag-charts/react-data-grid/docs/path/'}
        ${'/gallery'}            | ${'react'}      | ${'/ag-charts/gallery/'}
        ${'https://youtube.com'} | ${'react'}      | ${'https://youtube.com/'}
    `(
        'returns with trailing slash in "$expected" for url $url, framework $framework siteBaseUrl /ag-charts',
        ({ url, framework, expected }) => {
            const siteBaseUrl = '/ag-charts';
            expect(urlWithPrefix({ url, framework, siteBaseUrl, trailingSlash: true })).toBe(expected);
        }
    );

    test('does not add trailing slash for urls with #', () => {
        const url = './docs/path#some-hash';
        expect(urlWithPrefix({ url, framework: 'javascript', siteBaseUrl: '' })).toBe(
            '/javascript-data-grid/docs/path#some-hash'
        );
    });

    test('warns for invalid links', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        urlWithPrefix({ url: '../unhandled-link-type', framework: 'javascript', siteBaseUrl: '' });
        expect(spy).toBeCalled();
    });
});
