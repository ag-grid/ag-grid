import { expect, test } from '@jest/globals';
import minute from './minute';

test('minute', () => {
    const interval = minute;
    const date = new Date(2019, 7, 23, 15, 17, 5, 100);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2019, 7, 23, 15, 17, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2019, 7, 23, 15, 18, 0, 0));

    const range = interval.range(new Date(2019, 7, 23, 15, 17, 5, 100), new Date(2019, 7, 23, 15, 20, 5, 100));
    expect(range).toEqual([
        new Date(2019, 7, 23, 15, 18, 0, 0),
        new Date(2019, 7, 23, 15, 19, 0, 0),
        new Date(2019, 7, 23, 15, 20, 0, 0),
    ]);
});

test('minute.every', () => {
    const interval = minute.every(5)!;
    const date = new Date(2019, 7, 23, 15, 17, 5, 100);

    const floor = interval.floor(date);
    expect(floor).toEqual(new Date(2019, 7, 23, 15, 15, 0, 0));

    const ceil = interval.ceil(date);
    expect(ceil).toEqual(new Date(2019, 7, 23, 15, 20, 0, 0));

    const range = interval.range(new Date(2019, 7, 23, 15, 17, 5, 100), new Date(2019, 7, 23, 15, 32, 5, 100));
    expect(range).toEqual([
        new Date(2019, 7, 23, 15, 20, 0, 0),
        new Date(2019, 7, 23, 15, 25, 0, 0),
        new Date(2019, 7, 23, 15, 30, 0, 0),
    ]);
});
