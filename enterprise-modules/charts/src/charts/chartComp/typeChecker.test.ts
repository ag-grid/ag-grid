import {isDate} from './typeChecker';

describe('isDate', () => {
    it('returns true if value is instance of Date', () => {
        const value = new Date(2019, 11, 2);

        expect(isDate(value)).toBe(true);
    });

    it('returns false if value is string', () => {
        const value = 'foo';

        expect(isDate(value)).toBe(false);
    });

    it('returns false if value is number', () => {
        const value = 123;

        expect(isDate(value)).toBe(false);
    });

    it('returns false if value is undefined', () => {
        expect(isDate(undefined)).toBe(false);
    });
});
