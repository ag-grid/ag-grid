import { durationWeek } from "./duration";
import { CountableTimeInterval } from "./interval";

// Set date to n-th day of the week.
function weekday(n: number): CountableTimeInterval {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date: Date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - n) % 7);
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date: Date, weeks: number) {
        date.setUTCDate(date.getUTCDate() + weeks * 7);
    }
    // Count the number of weeks between the start and end dates.
    function count(start: Date, end: Date): number {
        return (end.getTime() - start.getTime()) / durationWeek;
    }

    return new CountableTimeInterval(floor, offset, count);
}

const utcSunday = weekday(0);
export const utcMonday = weekday(1);
export const utcThursday = weekday(4);

export default utcSunday;
