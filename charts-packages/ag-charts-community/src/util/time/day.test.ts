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

test('day.every stick to start', () => {
    const interval = day.every(5, { stickTo: 'start' });
    const ticks = interval.range(new Date(2023, 1, 1), new Date(2023, 1, 28));
    expect(ticks).toEqual([
        new Date(2023, 1, 1),
        new Date(2023, 1, 6),
        new Date(2023, 1, 11),
        new Date(2023, 1, 16),
        new Date(2023, 1, 21),
        new Date(2023, 1, 26),
    ]);
});

test('day.every stick to end', () => {
    const interval = day.every(5, { stickTo: 'end' });
    const ticks = interval.range(new Date(2023, 1, 1), new Date(2023, 1, 28));
    expect(ticks).toEqual([
        new Date(2023, 1, 3),
        new Date(2023, 1, 8),
        new Date(2023, 1, 13),
        new Date(2023, 1, 18),
        new Date(2023, 1, 23),
        new Date(2023, 1, 28),
    ]);
});

test('day.every stick to a date', () => {
    const interval = day.every(5, { stickTo: new Date(2023, 1, 2) });
    const ticks = interval.range(new Date(2023, 1, 1), new Date(2023, 1, 28));
    expect(ticks).toEqual([
        new Date(2023, 1, 2),
        new Date(2023, 1, 7),
        new Date(2023, 1, 12),
        new Date(2023, 1, 17),
        new Date(2023, 1, 22),
        new Date(2023, 1, 27),
    ]);
});

test('day.every stick to a different date', () => {
    const interval = day.every(5, { stickTo: new Date(2023, 1, 4) });
    const ticks = interval.range(new Date(2023, 1, 1), new Date(2023, 1, 28));
    expect(ticks).toEqual([
        new Date(2023, 1, 4),
        new Date(2023, 1, 9),
        new Date(2023, 1, 14),
        new Date(2023, 1, 19),
        new Date(2023, 1, 24),
    ]);
});
