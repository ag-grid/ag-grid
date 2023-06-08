import { CountableTimeInterval } from './interval';
import { durationWeek, durationDay } from './duration';
const baseSunday = Date.UTC(2023, 0, 1);
// Set date to n-th day of the week.
function weekday(n) {
    const base = new Date(baseSunday + n * durationDay).getTime();
    function encode(date) {
        return Math.floor((date.getTime() - base) / durationWeek);
    }
    function decode(encoded) {
        const d = new Date(base);
        d.setUTCDate(d.getUTCDate() + encoded * 7);
        d.setUTCHours(0, 0, 0, 0);
        return d;
    }
    return new CountableTimeInterval(encode, decode);
}
export const utcSunday = weekday(0);
export const utcMonday = weekday(1);
export const utcTuesday = weekday(2);
export const utcWednesday = weekday(3);
export const utcThursday = weekday(4);
export const utcFriday = weekday(5);
export const utcSaturday = weekday(6);
