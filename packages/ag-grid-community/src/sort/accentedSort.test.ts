import { _resolveStringComparator } from './accentedSort';

describe('_resolveStringComparator', () => {
    test('has no comparator when accentedSort is off', () => {
        expect(_resolveStringComparator(undefined, undefined).comparator).toBeUndefined();
        expect(_resolveStringComparator(false, undefined).comparator).toBeUndefined();
    });

    test('keeps the cache when an equal options object replaces the cached one', () => {
        const cache = _resolveStringComparator({ locales: ['de'], options: { sensitivity: 'base' } }, undefined);
        expect(_resolveStringComparator({ locales: ['de'], options: { sensitivity: 'base' } }, cache)).toBe(cache);
    });

    test('builds a new comparator when the options change', () => {
        const cache = _resolveStringComparator({ locales: 'de' }, undefined);
        const next = _resolveStringComparator({ locales: 'sv' }, cache);
        expect(next).not.toBe(cache);
        expect(next.comparator).not.toBe(cache.comparator);
        expect(_resolveStringComparator(false, next).comparator).toBeUndefined();
    });

    test('sorts with the requested locale', () => {
        const values = ['Örjan', 'Zoe', 'Ola'];
        expect([...values].sort(_resolveStringComparator({ locales: 'de' }, undefined).comparator)).toEqual([
            'Ola',
            'Örjan',
            'Zoe',
        ]);
        expect([...values].sort(_resolveStringComparator({ locales: 'sv' }, undefined).comparator)).toEqual([
            'Ola',
            'Zoe',
            'Örjan',
        ]);
    });
});
