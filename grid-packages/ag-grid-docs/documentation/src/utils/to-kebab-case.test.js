import toKebabCase from './to-kebab-case';

describe('toKebabCase', () => {
    it('converts sentence case to kebab case', () => {
        expect(toKebabCase('Bubble With Negative Values')).toBe('bubble-with-negative-values');
    });
});