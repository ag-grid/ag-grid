import { expect, test } from '@jest/globals';
import day from './day';

test('day', () => {
    const interval = day;
    const date = new Date(2023, 0, 18, 8, 31, 5, 100);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 18, 0, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 19, 0, 0, 0, 0));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 5, 100), new Date(2023, 0, 21, 8, 31, 5, 100));
    expect(range).toEqual([
        new Date(2023, 0, 19, 0, 0, 0, 0),
        new Date(2023, 0, 20, 0, 0, 0, 0),
        new Date(2023, 0, 21, 0, 0, 0, 0),
    ]);
});

test('day.every', () => {
    const interval = day.every(2);
    const date = new Date(2023, 0, 17, 8, 31, 5, 100);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 17, 0, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 19, 0, 0, 0, 0));

    const range = interval.range(new Date(2023, 0, 17, 8, 31, 5, 100), new Date(2023, 0, 23, 21, 31, 5, 100));
    expect(range).toEqual([
        new Date(2023, 0, 19, 0, 0, 0, 0),
        new Date(2023, 0, 21, 0, 0, 0, 0),
        new Date(2023, 0, 23, 0, 0, 0, 0),
    ]);
});
