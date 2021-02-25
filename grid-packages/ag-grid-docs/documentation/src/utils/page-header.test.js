import { getHeaderTitle } from './page-header';

describe('getHeaderTitle', () => {
    it.each([
        ['javascript', 'JavaScript'],
        ['angular', 'Angular'],
        ['vue', 'Vue'],
    ])('returns title for grid pages: %s', (framework, expected) => {
        expect(getHeaderTitle('The Best Grid', framework, false)).toBe(`AG Grid (${expected} Grid): The Best Grid`);
    });

    it('returns title for React grid pages', () => {
        expect(getHeaderTitle('The Best Grid', 'react', false)).toBe(`AG Grid (React Table): The Best Grid`);
    });

    it.each([
        ['javascript', 'JavaScript'],
        ['angular', 'Angular'],
        ['react', 'React'],
        ['vue', 'Vue'],
    ])('returns title for chart pages: %s', (framework, expected) => {
        expect(getHeaderTitle('The Best Charts', framework, true)).toBe(`AG Charts (${expected} Charts): The Best Charts`);
    });
});