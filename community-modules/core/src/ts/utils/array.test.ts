import { areEqual, forEachReverse } from './array';

describe('areEqual', () => {
    it.each([
        [undefined, undefined],
        [null, undefined],
        [undefined, null],
        [null, null],
    ])
        ('returns true if both arrays are missing or empty: a = %s, b = %s', (a, b) => {
            expect(areEqual(a, b)).toBe(true);
        });

    it.each([
        [undefined, []],
        [[], undefined],
        [null, []],
        [[], null],
    ])
        ('returns false if only one array is missing: a = %s, b = %s', (a, b) => {
            expect(areEqual(a, b)).toBe(false);
        });

    it('returns false if arrays are different length', () => {
        expect(areEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false if arrays contain different values', () => {
        expect(areEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('returns false if arrays contain same values in different orders', () => {
        expect(areEqual([1, 5, 8, 3], [1, 8, 5, 3])).toBe(false);
    });

    it('returns true if arrays contain same values in same order', () => {
        expect(areEqual([1, 5, 8, 3], [1, 5, 8, 3])).toBe(true);
    });

    it.each([
        [[{ getColId: () => 1 }, { getColId: () => 2 }], [{ getColId: () => 1 }, { getColId: () => 3 }], false],
        [[{ getColId: () => 3 }, { getColId: () => 7 }], [{ getColId: () => 3 }, { getColId: () => 7 }], true]
    ])
        ('can use custom comparator: a = %s, b = %s, expected = %s', (a, b, expected) => {
            expect(areEqual(a, b, (a, b) => a.getColId() === b.getColId())).toBe(expected);
        });
});

describe('forEachReverse', () => {
    it.each([undefined, null])('returns successfully if list is %s', value => {
        expect(() => forEachReverse(value!, () => { })).not.toThrow();
    });

    it('executes for each value in reverse order', () => {
        const result: number[] = [];

        forEachReverse([1, 4, 7], value => result.push(value));

        expect(result).toStrictEqual([7, 4, 1]);
    });
});

