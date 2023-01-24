import { expect, test } from '@jest/globals';
import { utcMonth } from './utcMonth';

test('UTC month', () => {
    const interval = utcMonth;
    const date = new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 125));

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(Date.UTC(2023, 1, 1, 0, 0, 0, 0)));

    const range = interval.range(
        new Date(Date.UTC(2023, 0, 18, 8, 31, 5, 125)),
        new Date(Date.UTC(2023, 3, 18, 8, 31, 5, 127))
    );
    expect(range).toEqual([
        new Date(Date.UTC(2023, 1, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 2, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 3, 1, 0, 0, 0, 0)),
    ]);
});

test('UTC month.every', () => {
    const interval = utcMonth.every(3);
    const date = new Date(Date.UTC(2023, 1, 18, 8, 31, 5, 125));

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(Date.UTC(2023, 0, 1, 0, 0, 0, 0)));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(Date.UTC(2023, 3, 1, 0, 0, 0, 0)));

    const range = interval.range(
        new Date(Date.UTC(2023, 1, 18, 8, 31, 5, 125)),
        new Date(Date.UTC(2023, 11, 18, 8, 31, 5, 127))
    );
    expect(range).toEqual([
        new Date(Date.UTC(2023, 3, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 6, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2023, 9, 1, 0, 0, 0, 0)),
    ]);
});
