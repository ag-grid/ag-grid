"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typeChecker_1 = require("./typeChecker");
describe('isDate', function () {
    it('returns true if value is instance of Date', function () {
        var value = new Date(2019, 11, 2);
        expect(typeChecker_1.isDate(value)).toBe(true);
    });
    it('returns false if value is string', function () {
        var value = 'foo';
        expect(typeChecker_1.isDate(value)).toBe(false);
    });
    it('returns false if value is number', function () {
        var value = 123;
        expect(typeChecker_1.isDate(value)).toBe(false);
    });
    it('returns false if value is undefined', function () {
        expect(typeChecker_1.isDate(undefined)).toBe(false);
    });
});
//# sourceMappingURL=typeChecker.test.js.map