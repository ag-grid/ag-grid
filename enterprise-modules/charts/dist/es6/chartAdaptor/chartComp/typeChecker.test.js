import { isDate } from './typeChecker';
describe('isDate', function () {
    it('returns true if value is instance of Date', function () {
        var value = new Date(2019, 11, 2);
        expect(isDate(value)).toBe(true);
    });
    it('returns false if value is string', function () {
        var value = 'foo';
        expect(isDate(value)).toBe(false);
    });
    it('returns false if value is number', function () {
        var value = 123;
        expect(isDate(value)).toBe(false);
    });
    it('returns false if value is undefined', function () {
        expect(isDate(undefined)).toBe(false);
    });
});
