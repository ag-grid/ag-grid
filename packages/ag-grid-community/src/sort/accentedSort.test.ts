import { _getStringComparator } from './accentedSort';

describe('_getStringComparator', () => {
    test('returns undefined when accentedSort is off', () => {
        expect(_getStringComparator(undefined)).toBeUndefined();
        expect(_getStringComparator(false)).toBeUndefined();
    });

    test('reuses the comparator for the same options object', () => {
        const options = { locales: 'de' };
        expect(_getStringComparator(options)).toBe(_getStringComparator(options));
    });

    test('equal options objects sort the same way', () => {
        const values = ['Örjan', 'Zoe', 'Ola'];
        const first = [...values].sort(_getStringComparator({ locales: 'de' }));
        const second = [...values].sort(_getStringComparator({ locales: 'de' }));
        expect(first).toEqual(['Ola', 'Örjan', 'Zoe']);
        expect(second).toEqual(first);
    });
});
