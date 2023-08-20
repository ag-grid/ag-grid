import { durationWeek } from './duration.mjs';
import { CountableTimeInterval } from './interval.mjs';
// Set date to n-th day of the week.
function weekday(n) {
    const base = new Date(2023, 0, 1 + n).getTime();
    function encode(date) {
        const dateMs = date.getTime();
        return Math.floor((dateMs - base) / durationWeek);
    }
    function decode(encoded) {
        const d = new Date(base);
        d.setDate(d.getDate() + encoded * 7);
        return d;
    }
    return new CountableTimeInterval(encode, decode);
}
export const sunday = weekday(0);
export const monday = weekday(1);
export const tuesday = weekday(2);
export const wednesday = weekday(3);
export const thursday = weekday(4);
export const friday = weekday(5);
export const saturday = weekday(6);
export default sunday;
