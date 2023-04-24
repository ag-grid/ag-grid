import { expect, test } from '@jest/globals';
import { sunday } from './week';
import { durationMinute } from './duration';

test('sunday.get/floor', () => {
    const date = new Date(Date.UTC(2019, 7, 23, 15, 10, 5, 100)); // 7 == August
    const sundayDate = sunday.floor(date);
    const utcSundayMs = Date.UTC(2019, 7, 18, 0, 0, 0, 0);
    expect(sundayDate.getTime()).toBe(utcSundayMs + sundayDate.getTimezoneOffset() * durationMinute);
});

test('sunday.range', () => {
    const d0 = new Date(Date.UTC(2019, 7, 23, 15, 10, 5, 100));
    const d1 = new Date(Date.UTC(2019, 8, 27, 10, 12, 2, 700));

    const utcAug25Ms = Date.UTC(2019, 7, 25, 0, 0, 0, 0);
    const utcSep01Ms = Date.UTC(2019, 8, 1, 0, 0, 0, 0);
    const utcSep08Ms = Date.UTC(2019, 8, 8, 0, 0, 0, 0);
    const utcSep15Ms = Date.UTC(2019, 8, 15, 0, 0, 0, 0);
    const utcSep22Ms = Date.UTC(2019, 8, 22, 0, 0, 0, 0);

    {
        const sundays = sunday.range(d0, d1);
        expect(sundays.length).toBe(5);
        expect(sundays[0].getTime()).toBe(utcAug25Ms + sundays[0].getTimezoneOffset() * durationMinute);
        expect(sundays[1].getTime()).toBe(utcSep01Ms + sundays[1].getTimezoneOffset() * durationMinute);
        expect(sundays[2].getTime()).toBe(utcSep08Ms + sundays[2].getTimezoneOffset() * durationMinute);
        expect(sundays[3].getTime()).toBe(utcSep15Ms + sundays[3].getTimezoneOffset() * durationMinute);
        expect(sundays[4].getTime()).toBe(utcSep22Ms + sundays[4].getTimezoneOffset() * durationMinute);
    }
});
