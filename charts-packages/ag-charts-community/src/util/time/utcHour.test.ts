import { expect, test } from '@jest/globals';
import { utcHour } from './utcHour';

test('UTC hour', () => {
    const interval = utcHour;
    const date = new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 100));

    const floor = interval.floor(date);
    expect(floor.getTime()).toBe(Date.UTC(2023, 0, 18, 8, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil.getTime()).toBe(Date.UTC(2023, 0, 18, 9, 0, 0, 0));

    const range = interval.range(
        new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 100)),
        new Date(Date.UTC(2023, 0, 18, 11, 31, 5, 100))
    );
    expect(range.map((d) => d.getTime())).toEqual([
        Date.UTC(2023, 0, 18, 9, 0, 0, 0),
        Date.UTC(2023, 0, 18, 10, 0, 0, 0),
        Date.UTC(2023, 0, 18, 11, 0, 0, 0),
    ]);
});

test('UTC hour.every', () => {
    const interval = utcHour.every(5, { snapTo: new Date(2023, 0, 18) });
    const date = new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 100));

    const floor = interval.floor(date);
    expect(floor.getTime()).toBe(Date.UTC(2023, 0, 18, 5, 0, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil.getTime()).toBe(Date.UTC(2023, 0, 18, 10, 0, 0, 0));

    const range = interval.range(
        new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 100)),
        new Date(Date.UTC(2023, 0, 18, 21, 31, 5, 100))
    );
    expect(range.map((d) => d.getTime())).toEqual([
        Date.UTC(2023, 0, 18, 10, 0, 0, 0),
        Date.UTC(2023, 0, 18, 15, 0, 0, 0),
        Date.UTC(2023, 0, 18, 20, 0, 0, 0),
    ]);
});

test('UTC hour.every with snapTo: null', () => {
    const interval = utcHour.every(5, { snapTo: null! });

    const range = interval.range(
        new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 100)),
        new Date(Date.UTC(2023, 0, 18, 21, 31, 5, 100))
    );
    expect(range.map((d) => d.getTime())).toEqual([
        Date.UTC(2023, 0, 18, 10, 0, 0, 0),
        Date.UTC(2023, 0, 18, 15, 0, 0, 0),
        Date.UTC(2023, 0, 18, 20, 0, 0, 0),
    ]);
});
