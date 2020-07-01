import { areEqual, every, some, forEach, map, filter, reduce, forEachReverse } from './array';

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

describe('every', () => {
    it.each([undefined, null])('returns true if list is %s', list => {
        expect(every(list, () => true)).toBe(true);
    });

    it('returns false if any element does not pass the predicate', () => {
        expect(every([1, 2, 3], value => value < 3)).toBe(false);
    });

    it('returns true if every element does pass the predicate', () => {
        expect(every([1, 2, 3], value => value < 5)).toBe(true);
    });

    it('short circuits as soon as an element does not pass the predicate', () => {
        let count = 0;
        const predicate = (value: number) => {
            count++;
            return value < 2;
        };

        expect(every([1, 2, 3], predicate)).toBe(false);
        expect(count).toBe(2);
    });
});

describe('some', () => {
    it.each([undefined, null])('returns false if list is %s', list => {
        expect(some(list, () => true)).toBe(false);
    });

    it('returns false if every element does not pass the predicate', () => {
        expect(some([1, 2, 3], value => value > 4)).toBe(false);
    });

    it('returns true if any element does pass the predicate', () => {
        expect(some([1, 2, 3], value => value > 2)).toBe(true);
    });

    it('short circuits as soon as an element does pass the predicate', () => {
        let count = 0;
        const predicate = (value: number) => {
            count++;
            return value > 1;
        };

        expect(some([1, 2, 3], predicate)).toBe(true);
        expect(count).toBe(2);
    });
});

describe('forEach', () => {
    it.each([undefined, null])('returns successfully if list is %s', value => {
        expect(() => forEach(value, () => { })).not.toThrow();
    });

    it('executes for each value in order', () => {
        const result: number[] = [];

        forEach([1, 4, 7], value => result.push(value));

        expect(result).toStrictEqual([1, 4, 7]);
    });
});

describe('forEachReverse', () => {
    it.each([undefined, null])('returns successfully if list is %s', value => {
        expect(() => forEachReverse(value, () => { })).not.toThrow();
    });

    it('executes for each value in reverse order', () => {
        const result: number[] = [];

        forEachReverse([1, 4, 7], value => result.push(value));

        expect(result).toStrictEqual([7, 4, 1]);
    });
});

describe('map', () => {
    it.each([undefined, null])('returns null if list to map is %s', list => {
        expect(map(list, x => true)).toBe(null);
    });

    it('returns mapped list', () => {
        expect(map([1, 2, 3], v => v.toString())).toStrictEqual(['1', '2', '3']);
    });
});

describe('filter', () => {
    it.each([undefined, null])('returns null if list to filter is %s', list => {
        expect(filter(list, x => true)).toBe(null);
    });

    it('returns filtered list', () => {
        expect(filter([1, 2, 3, 4, 5, 6], v => v % 2 === 0)).toStrictEqual([2, 4, 6]);
    });
});

describe('reduce', () => {
    it.each([undefined, null])('returns null if list to reduce is %s', list => {
        expect(reduce(list, x => true, {})).toBe(null);
    });

    it.each([undefined, null])('returns null if initial value is %s', initial => {
        expect(reduce([], x => true, initial)).toBe(null);
    });

    it('returns reduced number', () => {
        expect(reduce([1, 2, 3, 4, 5, 6], (acc, v) => acc + v, 0)).toBe(21);
    });

    it('returns reduced object', () => {
        expect(reduce([1, 2, 3], (acc, v) => { acc[v.toString()] = v; return acc; }, {} as { [key: string]: number; }))
            .toStrictEqual({
                1: 1,
                2: 2,
                3: 3
            });
    });
});
