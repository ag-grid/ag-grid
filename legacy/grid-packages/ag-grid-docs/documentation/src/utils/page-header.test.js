import { getHeaderTitle } from './page-header';

describe('getHeaderTitle', () => {
    it.each([
        ['javascript', 'JavaScript'],
        ['angular', 'Angular'],
        ['react', 'React'],
        ['vue', 'Vue'],
    ])('returns title for grid pages: %s', (framework, expected) => {
        expect(getHeaderTitle('The Best Grid', framework, false)).toBe(`${expected} Data Grid: The Best Grid`);
    });

    it.each([
        ['javascript', 'JavaScript'],
        ['angular', 'Angular'],
        ['react', 'React'],
        ['vue', 'Vue'],
    ])('returns title for chart pages: %s', (framework, expected) => {
        expect(getHeaderTitle('The Best Charts', framework, true)).toBe(`${expected} Charts: The Best Charts`);
    });
});
