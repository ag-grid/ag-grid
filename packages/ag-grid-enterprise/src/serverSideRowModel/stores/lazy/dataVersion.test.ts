import { describe, expect, test } from 'vitest';

import { compareDataVersions } from './dataVersion';

describe('compareDataVersions', () => {
    test('compares two numbers numerically by default', () => {
        expect(compareDataVersions(2, 10)).toBeLessThan(0);
        expect(compareDataVersions(10, 2)).toBeGreaterThan(0);
        expect(compareDataVersions(7, 7)).toBe(0);
    });

    test('only checks other versions for equality by default', () => {
        expect(compareDataVersions('v1', 'v1')).toBe(0);
        expect(compareDataVersions('v1', 'v2')).toBeNaN();
        expect(compareDataVersions('10', 10)).toBeNaN();
    });

    test('uses the comparator when one is provided', () => {
        const byDate = (a: string | number, b: string | number) => Date.parse(String(a)) - Date.parse(String(b));
        expect(compareDataVersions('2026-01-02', '2026-01-01', byDate)).toBeGreaterThan(0);
        expect(compareDataVersions('2026-01-01', '2026-01-02', byDate)).toBeLessThan(0);
        expect(compareDataVersions(1, 2, () => 0)).toBe(0);
    });
});
