import { expect, test } from '@jest/globals';
import { utcYear } from './utcYear';

test('UTC year', () => {
    const interval = utcYear;
    const date = new Date(Date.UTC(2023, 2, 18, 8, 31, 5, 125));

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(Date.UTC(2024, 0, 1, 0, 0, 0, 0)));

    const range = interval.range(
        new Date(Date.UTC(2023, 2, 18, 8, 31, 5, 125)),
        new Date(Date.UTC(2026, 3, 18, 8, 31, 5, 127))
    );
    expect(range).toEqual([
        new Date(Date.UTC(2024, 0, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 0)),
    ]);
});

test('UTC year.every', () => {
    const interval = utcYear.every(100);
    const date = new Date(Date.UTC(2023, 2, 18, 8, 31, 5, 125));

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(Date.UTC(2000, 0, 1, 0, 0, 0, 0)));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(Date.UTC(2100, 0, 1, 0, 0, 0, 0)));

    const range = interval.range(
        new Date(Date.UTC(2023, 2, 18, 8, 31, 5, 125)),
        new Date(Date.UTC(2345, 11, 18, 8, 31, 5, 127))
    );
    expect(range).toEqual([
        new Date(Date.UTC(2100, 0, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2200, 0, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2300, 0, 1, 0, 0, 0, 0)),
    ]);
});
