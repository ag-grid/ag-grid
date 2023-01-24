import { durationWeek } from './duration';
import { CountableTimeInterval } from './interval';

// Set date to n-th day of the week.
function weekday(n: number): CountableTimeInterval {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date: Date) {
        //                  1..31            1..7
        date.setDate(date.getDate() - ((date.getDay() + 7 - n) % 7));
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date: Date, weeks: number) {
        date.setDate(date.getDate() + weeks * 7);
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

export const sunday = weekday(0);
export const monday = weekday(1);
export const tuesday = weekday(2);
export const wednesday = weekday(3);
export const thursday = weekday(4);
export const friday = weekday(5);
export const saturday = weekday(6);

export default sunday;
