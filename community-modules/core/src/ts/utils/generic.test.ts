import { makeNull, exists, values } from './generic';

describe('makeNull', () => {
    it.each([4, 'string', new Date()])
        ('returns value if not null: %s', value => {
            expect(makeNull(value)).toBe(value);
        });

    it('converts undefined to null', () => {
        expect(makeNull(undefined)).toBeNull();
    });

    it('converts empty string to null', () => {
        expect(makeNull('')).toBeNull();
    });
});

describe('exists', () => {
    it('returns false for undefined', () => {
        expect(exists(undefined)).toBe(false);
    });

    it('returns false for null', () => {
        expect(exists(null)).toBe(false);
    });

    it('returns false for empty string by default', () => {
        expect(exists('')).toBe(false);
    });

    it('returns true for empty string if allowed', () => {
        expect(exists('', true)).toBe(true);
    });

    it.each(['string', 123, true])
        ('returns true if value is present: %s', value => {
            expect(exists(value)).toBe(true);
        });
});

describe('values', () => {
    it('returns values from an object', () => {
        const object = {
            a: 1,
            b: 2,
            c: 3,
        };

        expect(values(object)).toStrictEqual([1, 2, 3]);
    });

    it('returns values from a set', () => {
        const set = new Set<number>();
        set.add(1);
        set.add(2);
        set.add(3);

        expect(values(set)).toStrictEqual([1, 2, 3]);
    });
});