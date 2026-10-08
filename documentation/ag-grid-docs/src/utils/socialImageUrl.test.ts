import metadata from '../content/metadata/metadata.json';
import { getSocialImageUrl } from './socialImageUrl';

const CANONICAL_URL_BASE = 'https://www.ag-grid.com';

// SE-48: og:image and twitter:image must be absolute URLs.
describe('getSocialImageUrl', () => {
    test.each`
        image                                  | siteBaseUrl           | expected
        ${'/images/ag-grid-social.png'}        | ${'/'}                | ${'https://www.ag-grid.com/images/ag-grid-social.png'}
        ${'images/ag-grid-social.png'}         | ${'/'}                | ${'https://www.ag-grid.com/images/ag-grid-social.png'}
        ${'/images/ag-grid-social.png'}        | ${'/archive/34.0.0/'} | ${'https://www.ag-grid.com/archive/34.0.0/images/ag-grid-social.png'}
        ${'https://cdn.example.com/image.png'} | ${'/'}                | ${'https://cdn.example.com/image.png'}
    `('$image (base $siteBaseUrl) -> $expected', ({ image, siteBaseUrl, expected }) => {
        expect(getSocialImageUrl({ canonicalUrlBase: CANONICAL_URL_BASE, image, siteBaseUrl })).toBe(expected);
    });

    test('a trailing slash on canonicalUrlBase does not double the slash', () => {
        expect(
            getSocialImageUrl({ canonicalUrlBase: `${CANONICAL_URL_BASE}/`, image: '/a.png', siteBaseUrl: '/' })
        ).toBe('https://www.ag-grid.com/a.png');
    });

    test('the site-wide social image resolves to an absolute production URL', () => {
        expect(
            getSocialImageUrl({
                canonicalUrlBase: metadata.canonicalUrlBase,
                image: metadata.socialImage,
                siteBaseUrl: '/',
            })
        ).toMatch(/^https:\/\/www\.ag-grid\.com\/\S+\.png$/);
    });
});
