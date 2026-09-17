import { htmlHrefsWithBaseUrl } from './htmlHrefsWithBaseUrl';

describe('htmlHrefsWithBaseUrl', () => {
    test('prefixes root-relative hrefs with the base URL and leaves the rest alone', () => {
        const html =
            'See <a href="/eula/commercial/">the EULA</a>, <a class="x" href=\'/data-grid/community-vs-enterprise/\'>Enterprise</a>, <a href="https://example.com/">out</a> and <a href="#top">top</a>.';
        expect(htmlHrefsWithBaseUrl(html, '/base/')).toBe(
            'See <a href="/base/eula/commercial/">the EULA</a>, <a class="x" href=\'/base/data-grid/community-vs-enterprise/\'>Enterprise</a>, <a href="https://example.com/">out</a> and <a href="#top">top</a>.'
        );
    });

    test('is a no-op at the root base URL', () => {
        const html = '<a href="/eula/commercial/">EULA</a>';
        expect(htmlHrefsWithBaseUrl(html, '/')).toBe(html);
    });
});
