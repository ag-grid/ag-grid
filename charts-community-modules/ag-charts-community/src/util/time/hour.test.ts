import { expect, test } from '@jest/globals';
import hour from './hour';

test('hour', () => {
    const interval = hour;
    const date = new Date(2023, 0, 18, 8, 31, 5, 100);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 18, 8, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 18, 9, 0, 0, 0));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 5, 100), new Date(2023, 0, 18, 11, 31, 5, 100));
    expect(range).toEqual([
        new Date(2023, 0, 18, 9, 0, 0, 0),
        new Date(2023, 0, 18, 10, 0, 0, 0),
        new Date(2023, 0, 18, 11, 0, 0, 0),
    ]);
});

test('hour.every', () => {
    const interval = hour.every(5);
    const date = new Date(2023, 0, 18, 8, 31, 5, 100);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 18, 5, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 18, 10, 0, 0, 0));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 5, 100), new Date(2023, 0, 18, 21, 31, 5, 100));
    expect(range).toEqual([
        new Date(2023, 0, 18, 10, 0, 0, 0),
        new Date(2023, 0, 18, 15, 0, 0, 0),
        new Date(2023, 0, 18, 20, 0, 0, 0),
    ]);
});
