import { _exists, _makeNull } from './generic';

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

    it.each(['string', 123, true])('returns true if value is present: %s', (value) => {
        expect(_exists(value)).toBe(true);
    });
});
