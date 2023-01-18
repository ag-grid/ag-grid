import { expect, test } from '@jest/globals';
import year from './year';

test('year', () => {
    const interval = year;
    const date = new Date(2023, 2, 18, 8, 31, 5, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 1, 0, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2024, 0, 1, 0, 0, 0, 0));

    const range = interval.range(new Date(2023, 2, 18, 8, 31, 5, 125), new Date(2026, 3, 18, 8, 31, 5, 127));
    expect(range).toEqual([
        new Date(2024, 0, 1, 0, 0, 0, 0),
        new Date(2025, 0, 1, 0, 0, 0, 0),
        new Date(2026, 0, 1, 0, 0, 0, 0),
    ]);
});

test('year.every', () => {
    const interval = year.every(100);
    const date = new Date(2023, 2, 18, 8, 31, 5, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2000, 0, 1, 0, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2100, 0, 1, 0, 0, 0, 0));

    const range = interval.range(new Date(2023, 2, 18, 8, 31, 5, 125), new Date(2345, 11, 18, 8, 31, 5, 127));
    expect(range).toEqual([
        new Date(2100, 0, 1, 0, 0, 0, 0),
        new Date(2200, 0, 1, 0, 0, 0, 0),
        new Date(2300, 0, 1, 0, 0, 0, 0),
    ]);
});
