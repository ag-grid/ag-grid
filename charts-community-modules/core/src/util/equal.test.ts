import { equal } from "./equal";

describe('equal', () => {
    test('strings', () => {
        expect(equal(['a', 'b'], ['a', 'b'])).toBe(true);
        expect(equal(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
        expect(equal(['b', 'a'], ['a', 'b'])).toBe(false);
        expect(equal([], ['a', 'b'])).toBe(false);
        expect(equal(null, ['a', 'b'])).toBe(false);
        expect(equal(undefined, ['a', 'b'])).toBe(false);
        expect(equal({}, ['a', 'b'])).toBe(false);
        expect(equal(42, ['a', 'b'])).toBe(false);
    });

    test('objects', () => {
        expect(equal(
            [{a: 42, b: ['a', 'b']}],
            [{a: 42, b: ['a', 'b']}]
        )).toBe(true);
        expect(equal(
            [{a: 17, b: ['a', 'b']}],
            [{a: 42, b: ['a', 'b']}]
        )).toBe(false);
        expect(equal(
            [{a: 42, b: ['b', 'a']}],
            [{a: 42, b: ['a', 'b']}]
        )).toBe(false);
    });

    test('mixed', () => {
        expect(equal(
            [{a: 42, b: [{c: 13, d: 17}, 'b']}, {}],
            [{a: 42, b: [{c: 13, d: 17}, 'b']}, {}]
        )).toBe(true);
    });
});
