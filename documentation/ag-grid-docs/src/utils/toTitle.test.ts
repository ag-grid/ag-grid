import { toTitle } from './toTitle';

describe('toTitle', () => {
    test.each`
        str               | expected
        ${undefined}      | ${''}
        ${''}             | ${''}
        ${'title'}        | ${'Title'}
        ${'title-kebab'}  | ${'Title Kebab'}
        ${'title kebab'}  | ${'Title Kebab'}
        ${'title- kebab'} | ${'Title Kebab'}
    `('returns "$expected" for $str', ({ str, expected }) => {
        expect(toTitle(str)).toBe(expected);
    });
});
