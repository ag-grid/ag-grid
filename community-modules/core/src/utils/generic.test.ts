import { _exists, _makeNull, toBooleanOrUndefined } from './generic';

describe('_makeNull', () => {
    it.each([4, 'string', new Date()])('returns value if not null: %s', (value) => {
        expect(_makeNull(value)).toBe(value);
    });

    it('converts undefined to null', () => {
        expect(_makeNull(undefined)).toBeNull();
    });

    it('converts empty string to null', () => {
        expect(_makeNull('')).toBeNull();
    });
});

describe('exists', () => {
    it('returns false for undefined', () => {
        expect(_exists(undefined)).toBe(false);
    });

    it('returns false for null', () => {
        expect(_exists(null)).toBe(false);
    });

    it('returns false for empty string by default', () => {
        expect(_exists('')).toBe(false);
    });

    it('returns true for empty string if allowed', () => {
        expect(_exists('', true)).toBe(true);
    });

    it.each(['string', 123, true])('returns true if value is present: %s', (value) => {
        expect(_exists(value)).toBe(true);
    });
});

describe('toBooleanOrUndefined', () => {
    it('returns undefined for undefined', () => {
        expect(toBooleanOrUndefined(undefined)).toBeUndefined();
    });

    it('returns false for falsy', () => {
        expect(toBooleanOrUndefined(false)).toBe(false);
        expect(toBooleanOrUndefined(0)).toBe(false);
    });

    it('returns true for truthy', () => {
        expect(toBooleanOrUndefined(true)).toBe(true);
        expect(toBooleanOrUndefined('')).toBe(true);
        expect(toBooleanOrUndefined('true')).toBe(true);
        expect(toBooleanOrUndefined('True')).toBe(true);
    });
});
