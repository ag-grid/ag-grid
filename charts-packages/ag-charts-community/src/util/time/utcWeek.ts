import { durationWeek } from './duration';
import { CountableTimeInterval } from './interval';

// Set date to n-th day of the week.
function weekday(n: number): CountableTimeInterval {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date: Date) {
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 7 - n) % 7));
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date: Date, weeks: number) {
        date.setUTCDate(date.getUTCDate() + weeks * 7);
    }

    function stepTest(date: Date, weeks: number) {
        const start = new Date(0);
        floor(start);

        const end = new Date(date.getTime() + 1);
        floor(end);
        offset(end, 1);

        return Math.floor((end.getTime() - start.getTime()) / durationWeek) % weeks === 0;
    }

    return new CountableTimeInterval(floor, offset, stepTest);
}

export const utcSunday = weekday(0);
export const utcMonday = weekday(1);
export const utcThursday = weekday(4);
