import { _defaultComparator, _makeNull } from './generic';

describe('_makeNull', () => {
    it.each([4, 'string', new Date()])('returns value if not null: %s', (value) => {
        expect(_makeNull(value)).toBe(value);
    });

    it('converts undefined to null', () => {
        expect(_makeNull()).toBeNull();
    });

    it('converts empty string to null', () => {
        expect(_makeNull('')).toBeNull();
    });
});

describe('_defaultComparator', () => {
    const sign = (n: number) => {
        if (n > 0) {
            return 1;
        }
        if (n < 0) {
            return -1;
        }
        return 0;
    };

    describe('nullish handling', () => {
        it('returns 0 when both values are null', () => {
            expect(_defaultComparator(null, null)).toBe(0);
        });

        it('returns 0 when both values are undefined', () => {
            expect(_defaultComparator(undefined, undefined)).toBe(0);
        });

        it('treats null and undefined as equivalent', () => {
            expect(_defaultComparator(null, undefined)).toBe(0);
            expect(_defaultComparator(undefined, null)).toBe(0);
        });

        it('sorts null before non-null', () => {
            expect(_defaultComparator(null, 5)).toBe(-1);
            expect(_defaultComparator(5, null)).toBe(1);
        });
    });

    describe('primitive comparison', () => {
        it('compares numbers in ascending order', () => {
            expect(sign(_defaultComparator(1, 2))).toBe(-1);
            expect(sign(_defaultComparator(2, 1))).toBe(1);
            expect(_defaultComparator(2, 2)).toBe(0);
        });

        it('compares strings lexicographically by default', () => {
            expect(sign(_defaultComparator('a', 'b'))).toBe(-1);
            expect(sign(_defaultComparator('b', 'a'))).toBe(1);
            expect(_defaultComparator('a', 'a')).toBe(0);
        });

        it('uses localeCompare when accentedCompare is enabled for strings', () => {
            // accentedCompare delegates to localeCompare which handles collation (e.g. "é" vs "e")
            expect(sign(_defaultComparator('a', 'b', true))).toBe(-1);
            expect(_defaultComparator('é', 'é', true)).toBe(0);
        });
    });

    describe('aggregation wrapper unwrapping', () => {
        it('unwraps a wrapper with toNumber() (built-in avg/count style)', () => {
            const a = { toNumber: () => 10, toString: () => '10' };
            const b = { toNumber: () => 20, toString: () => '20' };

            // Without unwrap, string comparison on "10"/"20" would also give -1 here, so also check
            // a case where string and numeric comparison disagree ("9" > "10" as strings).
            const nine = { toNumber: () => 9, toString: () => '9' };
            const ten = { toNumber: () => 10, toString: () => '10' };

            expect(sign(_defaultComparator(a, b))).toBe(-1);
            expect(sign(_defaultComparator(b, a))).toBe(1);
            expect(sign(_defaultComparator(nine, ten))).toBe(-1); // numeric, not lexicographic
        });

        it('compares wrapper against bare scalar via toNumber()', () => {
            // Group-level agg cell compared against a leaf scalar — common when sorting a column
            // where only some rows have aggregated values.
            const wrapped = { toNumber: () => 10 };
            expect(sign(_defaultComparator(wrapped, 5))).toBe(1);
            expect(sign(_defaultComparator(5, wrapped))).toBe(-1);
            expect(_defaultComparator(wrapped, 10)).toBe(0);
        });

        it('does not unwrap arbitrary objects without toNumber()', () => {
            // Domain objects exposed via valueGetter (e.g. `{ value: 5, label: 'High' }`) must NOT
            // be silently unwrapped — they're treated as opaque, and `>`/`<` on objects coerces via
            // toString to `"[object Object]"` on both sides, returning 0. Sort stability for such
            // objects is the user's responsibility (custom comparator).
            const a = { value: 5, label: 'High' };
            const b = { value: 50, label: 'Low' };
            expect(_defaultComparator(a, b)).toBe(0);
        });

        it('ignores a non-function `toNumber` property (defensive against truthy collisions)', () => {
            // A user object where `toNumber` is a truthy non-function (e.g. a stale string) must not
            // be invoked; treat the wrapper as opaque instead of throwing.
            const a = { toNumber: 'oops', value: 1 };
            const b = { toNumber: 'oops', value: 2 };
            expect(_defaultComparator(a, b)).toBe(0);
        });

        it('treats wrapper whose toNumber() yields null as nullish (sorts before non-null)', () => {
            // Empty groups commonly produce `{ toNumber: () => null, ... }`. Without the post-unwrap
            // nullish recheck, the unwrapped null would be coerced to 0 by `<`/`>` and sort after
            // negative numbers. The recheck restores the standard null-sorts-first ordering.
            const wrapped = { toNumber: () => null, toString: () => '' };
            expect(_defaultComparator(wrapped, null)).toBe(0);
            expect(sign(_defaultComparator(wrapped, 5))).toBe(-1);
            expect(sign(_defaultComparator(wrapped, -10))).toBe(-1);
            expect(sign(_defaultComparator(wrapped, 0))).toBe(-1);
        });
    });
});
