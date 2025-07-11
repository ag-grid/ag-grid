import { _makeNull } from './generic';

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
