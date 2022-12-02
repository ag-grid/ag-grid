import { durationMinute, durationWeek } from "./duration";
import { CountableTimeInterval } from "./interval";

// Set date to n-th day of the week.
function weekday(n: number): CountableTimeInterval {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date: Date) {
        //                  1..31            1..7
        date.setDate(date.getDate() - (date.getDay() + 7 - n) % 7);
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date: Date, weeks: number) {
        date.setDate(date.getDate() + weeks * 7);
    }
    // Count the number of weeks between the start and end dates.
    function count(start: Date, end: Date): number {
        const msDelta = end.getTime() - start.getTime();
        const tzMinuteDelta = end.getTimezoneOffset() - start.getTimezoneOffset();
        return (msDelta - tzMinuteDelta * durationMinute) / durationWeek;
    }

    return new CountableTimeInterval(floor, offset, count);
}

export const sunday = weekday(0);
export const monday = weekday(1);
export const thursday = weekday(4);

export default sunday;
