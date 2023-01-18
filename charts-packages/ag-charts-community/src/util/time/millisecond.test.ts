import { expect, test } from '@jest/globals';
import millisecond from './millisecond';

test('millisecond', () => {
    const interval = millisecond;
    const date = new Date(2023, 0, 18, 8, 31, 5, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 18, 8, 31, 5, 125));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 18, 8, 31, 5, 125));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 5, 125), new Date(2023, 0, 18, 8, 31, 5, 127));
    expect(range).toEqual([
        new Date(2023, 0, 18, 8, 31, 5, 125),
        new Date(2023, 0, 18, 8, 31, 5, 126),
        new Date(2023, 0, 18, 8, 31, 5, 127),
    ]);
});

test('millisecond.every', () => {
    const interval = millisecond.every(100);
    const date = new Date(2023, 0, 18, 8, 31, 5, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 18, 8, 31, 5, 100));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 18, 8, 31, 5, 200));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 5, 125), new Date(2023, 0, 18, 8, 31, 5, 457));
    expect(range).toEqual([
        new Date(2023, 0, 18, 8, 31, 5, 200),
        new Date(2023, 0, 18, 8, 31, 5, 300),
        new Date(2023, 0, 18, 8, 31, 5, 400),
    ]);
});
