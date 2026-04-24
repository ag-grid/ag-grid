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
    const sign = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);

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

        it('unwraps a wrapper with only .value (custom aggFunc style)', () => {
            // Custom aggregation functions may return `{ value: N, ...extra }` without toNumber.
            // Previously `_defaultComparator` compared these as objects (>/< on objects => false),
            // effectively breaking sort on those columns.
            const a = { value: 5, label: 'a' };
            const b = { value: 50, label: 'b' };
            const c = { value: 9, label: 'c' };

            expect(sign(_defaultComparator(a, b))).toBe(-1);
            expect(sign(_defaultComparator(b, a))).toBe(1);
            // numeric (9 < 50) — not lexicographic (where "50" < "9")
            expect(sign(_defaultComparator(c, b))).toBe(-1);
        });

        it('prefers toNumber() over .value when both are present', () => {
            // If both are defined and disagree, toNumber() wins — matches the priority ordering in
            // dataTypeService's scalar-resolution logic.
            const a = { toNumber: () => 1, value: 999, toString: () => '1' };
            const b = { toNumber: () => 2, value: 0, toString: () => '2' };

            expect(sign(_defaultComparator(a, b))).toBe(-1);
        });

        it('leaves plain objects without toNumber or .value unchanged', () => {
            // A bare object with neither shape should not be unwrapped — `<`/`>` on objects coerces
            // via `toString()`, yielding "[object Object]" on both sides → 0.
            const a = { foo: 1 };
            const b = { foo: 2 };
            expect(_defaultComparator(a, b)).toBe(0);
        });

        it('handles a mix of wrapped and unwrapped values', () => {
            // Group-level agg cell compared against a leaf scalar — common when sorting a column where
            // only some rows have aggregated values.
            const wrapped = { value: 10 };
            expect(sign(_defaultComparator(wrapped, 5))).toBe(1);
            expect(sign(_defaultComparator(5, wrapped))).toBe(-1);
            expect(_defaultComparator(wrapped, 10)).toBe(0);
        });
    });
});
