import { expect, test } from '@jest/globals';
import second from './second';

test('second', () => {
    const interval = second;
    const date = new Date(2023, 0, 18, 8, 31, 5, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 18, 8, 31, 5, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 18, 8, 31, 6, 0));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 5, 125), new Date(2023, 0, 18, 8, 31, 8, 127));
    expect(range).toEqual([
        new Date(2023, 0, 18, 8, 31, 6, 0),
        new Date(2023, 0, 18, 8, 31, 7, 0),
        new Date(2023, 0, 18, 8, 31, 8, 0),
    ]);
});

test('second.every', () => {
    const interval = second.every(10);
    const date = new Date(2023, 0, 18, 8, 31, 25, 125);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2023, 0, 18, 8, 31, 20, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2023, 0, 18, 8, 31, 30, 0));

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 25, 125), new Date(2023, 0, 18, 8, 31, 55, 457));
    expect(range).toEqual([
        new Date(2023, 0, 18, 8, 31, 35, 0),
        new Date(2023, 0, 18, 8, 31, 45, 0),
        new Date(2023, 0, 18, 8, 31, 55, 0),
    ]);
});

test('second.every with snapTo: null', () => {
    const interval = second.every(10, { snapTo: null! });

    const range = interval.range(new Date(2023, 0, 18, 8, 31, 25, 125), new Date(2023, 0, 18, 8, 31, 55, 457));
    expect(range).toEqual([
        new Date(2023, 0, 18, 8, 31, 30, 0),
        new Date(2023, 0, 18, 8, 31, 40, 0),
        new Date(2023, 0, 18, 8, 31, 50, 0),
    ]);
});
