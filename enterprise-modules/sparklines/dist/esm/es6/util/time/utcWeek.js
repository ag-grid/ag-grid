import { durationWeek } from "./duration";
import { CountableTimeInterval } from "./interval";
// Set date to n-th day of the week.
function weekday(n) {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - n) % 7);
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date, weeks) {
        date.setUTCDate(date.getUTCDate() + weeks * 7);
    }
    // Count the number of weeks between the start and end dates.
    function count(start, end) {
        return (end.getTime() - start.getTime()) / durationWeek;
    }
    return new CountableTimeInterval(floor, offset, count);
}
export const utcSunday = weekday(0);
export const utcMonday = weekday(1);
export const utcTuesday = weekday(2);
export const utcWednesday = weekday(3);
export const utcThursday = weekday(4);
export const utcFriday = weekday(5);
export const utcSaturday = weekday(6);
export default utcSunday;
