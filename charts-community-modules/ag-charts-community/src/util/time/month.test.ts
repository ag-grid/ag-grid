import { expect, test } from '@jest/globals';
import month from './month';

test('month', () => {
    const interval = month;
    const date = new Date(2023, 0, 18, 8, 31, 5, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 1, 0, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 1, 1, 0, 0, 0, 0));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 5, 125), new Date(2023, 3, 18, 8, 31, 5, 127));
    expect(range).toEqual([
        new Date(2023, 1, 1, 0, 0, 0, 0),
        new Date(2023, 2, 1, 0, 0, 0, 0),
        new Date(2023, 3, 1, 0, 0, 0, 0),
    ]);
});

test('month.every', () => {
    const interval = month.every(3);
    const date = new Date(2023, 1, 18, 8, 31, 5, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 1, 0, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 3, 1, 0, 0, 0, 0));

    const range = interval.range(new Date(2023, 1, 18, 8, 31, 5, 125), new Date(2023, 11, 18, 8, 31, 5, 127));
    expect(range).toEqual([
        new Date(2023, 4, 1, 0, 0, 0, 0),
        new Date(2023, 7, 1, 0, 0, 0, 0),
        new Date(2023, 10, 1, 0, 0, 0, 0),
    ]);
});

test('month.every with snapTo: null', () => {
    const interval = month.every(3, { snapTo: null! });

    const range = interval.range(new Date(2023, 1, 18, 8, 31, 5, 125), new Date(2023, 11, 18, 8, 31, 5, 127));
    expect(range).toEqual([
        new Date(2023, 3, 1, 0, 0, 0, 0),
        new Date(2023, 6, 1, 0, 0, 0, 0),
        new Date(2023, 9, 1, 0, 0, 0, 0),
    ]);
});
