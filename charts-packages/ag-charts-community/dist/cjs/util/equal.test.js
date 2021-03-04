"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var equal_1 = require("./equal");
describe('equal', function () {
    test('strings', function () {
        expect(equal_1.equal(['a', 'b'], ['a', 'b'])).toBe(true);
        expect(equal_1.equal(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
        expect(equal_1.equal(['b', 'a'], ['a', 'b'])).toBe(false);
        expect(equal_1.equal([], ['a', 'b'])).toBe(false);
        expect(equal_1.equal(null, ['a', 'b'])).toBe(false);
        expect(equal_1.equal(undefined, ['a', 'b'])).toBe(false);
        expect(equal_1.equal({}, ['a', 'b'])).toBe(false);
        expect(equal_1.equal(42, ['a', 'b'])).toBe(false);
    });
    test('objects', function () {
        expect(equal_1.equal([{ a: 42, b: ['a', 'b'] }], [{ a: 42, b: ['a', 'b'] }])).toBe(true);
        expect(equal_1.equal([{ a: 17, b: ['a', 'b'] }], [{ a: 42, b: ['a', 'b'] }])).toBe(false);
        expect(equal_1.equal([{ a: 42, b: ['b', 'a'] }], [{ a: 42, b: ['a', 'b'] }])).toBe(false);
    });
    test('mixed', function () {
        expect(equal_1.equal([{ a: 42, b: [{ c: 13, d: 17 }, 'b'] }, {}], [{ a: 42, b: [{ c: 13, d: 17 }, 'b'] }, {}])).toBe(true);
    });
});
//# sourceMappingURL=equal.test.js.map