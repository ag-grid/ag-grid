import { _areEqual, _indexMap, _pushToMapArray, _removeAllFromArray, _symmetricDiff } from './array';

describe('areEqual', () => {
    it.each([
        [undefined, undefined],
        [null, undefined],
        [undefined, null],
        [null, null],
    ])('returns true if both arrays are missing or empty: a = %s, b = %s', (a, b) => {
        expect(_areEqual(a, b)).toBe(true);
    });

    it.each([
        [undefined, []],
        [[], undefined],
        [null, []],
        [[], null],
    ])('returns false if only one array is missing: a = %s, b = %s', (a, b) => {
        expect(_areEqual(a, b)).toBe(false);
    });

    it('returns false if arrays are different length', () => {
        expect(_areEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false if arrays contain different values', () => {
        expect(_areEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('returns false if arrays contain same values in different orders', () => {
        expect(_areEqual([1, 5, 8, 3], [1, 8, 5, 3])).toBe(false);
    });

    it('returns true if arrays contain same values in same order', () => {
        expect(_areEqual([1, 5, 8, 3], [1, 5, 8, 3])).toBe(true);
    });

    it.each([
        [[{ getColId: () => 1 }, { getColId: () => 2 }], [{ getColId: () => 1 }, { getColId: () => 3 }], false],
        [[{ getColId: () => 3 }, { getColId: () => 7 }], [{ getColId: () => 3 }, { getColId: () => 7 }], true],
    ])('can use custom comparator: a = %s, b = %s, expected = %s', (a, b, expected) => {
        expect(_areEqual(a, b, (a, b) => a.getColId() === b.getColId())).toBe(expected);
    });
});

describe('_removeAllFromArray', () => {
    it('leaves array unchanged when removing empty set', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, []);
        expect(array).toEqual([1, 2, 3, 4]);
    });

    it('removes single element', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, [3]);
        expect(array).toEqual([1, 2, 4]);
    });

    it('removes first element', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, [1]);
        expect(array).toEqual([2, 3, 4]);
    });

    it('removes last element', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, [4]);
        expect(array).toEqual([1, 2, 3]);
    });

    it('removes first n elements', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, [1, 2]);
        expect(array).toEqual([3, 4]);
    });

    it('removes last n elements', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, [3, 4]);
        expect(array).toEqual([1, 2]);
    });

    it('removes middle n elements', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, [2, 3]);
        expect(array).toEqual([1, 4]);
    });

    it('removes n disjoint elements', () => {
        const array = [1, 2, 3, 4];
        _removeAllFromArray(array, [2, 4]);
        expect(array).toEqual([1, 3]);
    });

    it('removes any instance of given element', () => {
        const array = [1, 2, 3, 1, 4];
        _removeAllFromArray(array, [1]);
        expect(array).toEqual([2, 3, 4]);
    });
});

describe('_symmetricDiff', () => {
    it.each([
        [null, null],
        [undefined, undefined],
        [null, undefined],
        [[], []],
        [[], null],
    ])('returns [] when both sides are empty or missing: a = %s, b = %s', (a, b) => {
        expect(_symmetricDiff(a, b)).toEqual([]);
    });

    it('returns [] for the same array reference (fast path)', () => {
        const a = [1, 2, 3];
        expect(_symmetricDiff(a, a)).toEqual([]);
    });

    it('returns a copy of the non-empty side when the other is empty', () => {
        const a = [1, 2, 3];
        const result = _symmetricDiff(a, []);
        expect(result).toEqual([1, 2, 3]);
        expect(result).not.toBe(a);

        expect(_symmetricDiff([], [4, 5])).toEqual([4, 5]);
        expect(_symmetricDiff(null, [4, 5])).toEqual([4, 5]);
    });

    it('returns [] when both sides hold the same elements', () => {
        expect(_symmetricDiff([1, 2, 3], [3, 2, 1])).toEqual([]);
    });

    it('returns survivors in a-order then additions in b-order', () => {
        // 1 only in a (survives), 2 & 3 in both (cancel), 4 only in b (added).
        expect(_symmetricDiff([1, 2, 3], [2, 3, 4])).toEqual([1, 4]);
    });

    it('handles a single differing element on each side', () => {
        expect(_symmetricDiff([1], [2])).toEqual([1, 2]);
    });

    it('compares by reference identity for objects', () => {
        const shared = { id: 1 };
        const onlyA = { id: 2 };
        const onlyB = { id: 3 };
        expect(_symmetricDiff([shared, onlyA], [shared, onlyB])).toEqual([onlyA, onlyB]);
    });
});

describe('_indexMap', () => {
    it.each([[null], [undefined], [[]]])('returns an empty map for %s', (arr) => {
        expect(_indexMap(arr).size).toBe(0);
    });

    it('maps each element to its index', () => {
        const map = _indexMap(['a', 'b', 'c']);
        expect(map.get('a')).toBe(0);
        expect(map.get('b')).toBe(1);
        expect(map.get('c')).toBe(2);
    });

    it('keeps the last index for duplicate elements', () => {
        const map = _indexMap(['a', 'b', 'a']);
        expect(map.get('a')).toBe(2);
        expect(map.get('b')).toBe(1);
    });
});

describe('_pushToMapArray', () => {
    it('creates a new bucket on first use', () => {
        const map = new Map<string, number[]>();
        _pushToMapArray(map, 'k', 1);
        expect(map.get('k')).toEqual([1]);
    });

    it('appends to an existing bucket', () => {
        const map = new Map<string, number[]>();
        _pushToMapArray(map, 'k', 1);
        _pushToMapArray(map, 'k', 2);
        expect(map.get('k')).toEqual([1, 2]);
    });

    it('keeps buckets separate per key', () => {
        const map = new Map<string, number[]>();
        _pushToMapArray(map, 'a', 1);
        _pushToMapArray(map, 'b', 2);
        expect(map.get('a')).toEqual([1]);
        expect(map.get('b')).toEqual([2]);
    });
});
