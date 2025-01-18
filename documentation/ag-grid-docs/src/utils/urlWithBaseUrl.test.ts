import { urlWithBaseUrl } from './urlWithBaseUrl';

describe('urlWithBaseUrl', () => {
    test.each`
        url                       | expected
        ${'docs'}                 | ${'/docs'}
        ${'/docs'}                | ${'/docs'}
        ${'./docs'}               | ${'/docs'}
        ${'./docs/path'}          | ${'/docs/path'}
        ${'/gallery'}             | ${'/gallery'}
        ${'/gallery/'}            | ${'/gallery/'}
        ${'https://youtube.com'}  | ${'https://youtube.com'}
        ${'https://youtube.com/'} | ${'https://youtube.com/'}
    `('$url (empty siteBaseUrl) -> $expected', ({ url, expected }) => {
        const siteBaseUrl = '';
        expect(urlWithBaseUrl(url, siteBaseUrl)).toBe(expected);
    });

    test.each`
        url                       | expected
        ${'docs'}                 | ${'/ag-charts/docs'}
        ${'/docs'}                | ${'/ag-charts/docs'}
        ${'./docs'}               | ${'/ag-charts/docs'}
        ${'./docs/path'}          | ${'/ag-charts/docs/path'}
        ${'/gallery'}             | ${'/ag-charts/gallery'}
        ${'/gallery/'}            | ${'/ag-charts/gallery/'}
        ${'https://youtube.com'}  | ${'https://youtube.com'}
        ${'https://youtube.com/'} | ${'https://youtube.com/'}
    `('$url (siteBaseUrl: /ag-charts) -> $expected', ({ url, expected }) => {
        const siteBaseUrl = '/ag-charts';
        expect(urlWithBaseUrl(url, siteBaseUrl)).toBe(expected);
    });

    test.each`
        url                       | expected
        ${'docs'}                 | ${'/ag-charts/docs'}
        ${'/docs'}                | ${'/ag-charts/docs'}
        ${'./docs'}               | ${'/ag-charts/docs'}
        ${'./docs/path'}          | ${'/ag-charts/docs/path'}
        ${'/gallery'}             | ${'/ag-charts/gallery'}
        ${'/gallery/'}            | ${'/ag-charts/gallery/'}
        ${'https://youtube.com'}  | ${'https://youtube.com'}
        ${'https://youtube.com/'} | ${'https://youtube.com/'}
    `('$url (siteBaseUrl: /ag-charts/) -> $expected', ({ url, expected }) => {
        const siteBaseUrl = '/ag-charts/';
        expect(urlWithBaseUrl(url, siteBaseUrl)).toBe(expected);
    });
});
