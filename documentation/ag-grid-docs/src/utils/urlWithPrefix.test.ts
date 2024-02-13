import { urlWithPrefix } from './urlWithPrefix';

describe('urlWithPrefix', () => {
    test.each`
        url                      | framework       | expected
        ${'./docs'}              | ${'javascript'} | ${'/ag-charts/javascript/docs'}
        ${'./docs'}              | ${'react'}      | ${'/ag-charts/react/docs'}
        ${'./docs/path'}         | ${'react'}      | ${'/ag-charts/react/docs/path'}
        ${'/gallery'}            | ${'react'}      | ${'/ag-charts/gallery'}
        ${'https://youtube.com'} | ${'react'}      | ${'https://youtube.com'}
    `(
        'returns "$expected" for url $url, framework $framework siteBaseUrl /ag-charts',
        ({ url, framework, expected }) => {
            const siteBaseUrl = '/ag-charts';
            expect(urlWithPrefix({ url, framework, siteBaseUrl })).toBe(expected);
        }
    );

    test('warns for invalid links', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        urlWithPrefix({ url: '../unhandled-link-type', framework: 'javascript', siteBaseUrl: '' });
        expect(spy).toBeCalled();
    });
});
