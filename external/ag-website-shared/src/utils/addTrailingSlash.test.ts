import { addTrailingSlash } from '@ag-website-shared/utils/addTrailingSlash';

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
