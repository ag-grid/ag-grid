import { _areEqual, _removeAllFromArray } from './array';

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
