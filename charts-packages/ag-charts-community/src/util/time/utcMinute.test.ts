import { expect, test } from '@jest/globals';
import { utcMinute } from './utcMinute';

test('UTC minute', () => {
    const interval = utcMinute;
    const date = new Date(Date.UTC(2019, 7, 23, 15, 17, 5, 100));

    const floor = interval.floor(date);
    expect(floor.getTime()).toBe(Date.UTC(2019, 7, 23, 15, 17, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil.getTime()).toBe(Date.UTC(2019, 7, 23, 15, 18, 0, 0));

    const range = interval.range(
        new Date(Date.UTC(2019, 7, 23, 15, 17, 5, 100)),
        new Date(Date.UTC(2019, 7, 23, 15, 20, 5, 100))
    );
    expect(range.map((d) => d.getTime())).toEqual([
        Date.UTC(2019, 7, 23, 15, 18, 0, 0),
        Date.UTC(2019, 7, 23, 15, 19, 0, 0),
        Date.UTC(2019, 7, 23, 15, 20, 0, 0),
    ]);
});

test('UTC minute.every', () => {
    const interval = utcMinute.every(5);
    const date = new Date(Date.UTC(2019, 7, 23, 15, 17, 5, 100));

    const floor = interval.floor(date);
    expect(floor.getTime()).toBe(Date.UTC(2019, 7, 23, 15, 15, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil.getTime()).toBe(Date.UTC(2019, 7, 23, 15, 20, 0, 0));

    const range = interval.range(
        new Date(Date.UTC(2019, 7, 23, 15, 17, 5, 100)),
        new Date(Date.UTC(2019, 7, 23, 15, 32, 5, 100))
    );
    expect(range.map((d) => d.getTime())).toEqual([
        Date.UTC(2019, 7, 23, 15, 20, 0, 0),
        Date.UTC(2019, 7, 23, 15, 25, 0, 0),
        Date.UTC(2019, 7, 23, 15, 30, 0, 0),
    ]);
});
