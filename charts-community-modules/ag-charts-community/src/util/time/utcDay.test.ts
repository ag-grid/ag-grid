import { expect, test } from '@jest/globals';
import utcDay from './utcDay';

test('UTC day', () => {
    const interval = utcDay;
    const date = new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 100));

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(Date.UTC(2023, 0, 18, 0, 0, 0, 0)));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(Date.UTC(2023, 0, 19, 0, 0, 0, 0)));

    const range = interval.range(
        new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 100)),
        new Date(Date.UTC(2023, 0, 21, 8, 31, 5, 100))
    );
    expect(range).toEqual([
        new Date(Date.UTC(2023, 0, 19, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 0, 20, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 0, 21, 0, 0, 0, 0)),
    ]);
});

test('UTC day.every', () => {
    const interval = utcDay.every(2);
    const date = new Date(Date.UTC(2023, 0, 17, 8, 31, 5, 100));

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(Date.UTC(2023, 0, 17, 0, 0, 0, 0)));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(Date.UTC(2023, 0, 19, 0, 0, 0, 0)));

    const range = interval.range(
        new Date(Date.UTC(2023, 0, 17, 8, 31, 5, 100)),
        new Date(Date.UTC(2023, 0, 23, 21, 31, 5, 100))
    );
    expect(range).toEqual([
        new Date(Date.UTC(2023, 0, 19, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 0, 21, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 0, 23, 0, 0, 0, 0)),
    ]);
});

test('UTC day.every with snapTo: null', () => {
    const interval = utcDay.every(2, { snapTo: null! });

    const range = interval.range(
        new Date(Date.UTC(2023, 0, 17, 8, 31, 5, 100)),
        new Date(Date.UTC(2023, 0, 23, 21, 31, 5, 100))
    );
    expect(range).toEqual([
        new Date(Date.UTC(2023, 0, 19, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 0, 21, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 0, 23, 0, 0, 0, 0)),
    ]);
});
