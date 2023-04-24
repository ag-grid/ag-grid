import { durationWeek, durationDay } from './duration';
import { CountableTimeInterval } from './interval';

const baseSunday = new Date(2023, 0, 1);

// Set date to n-th day of the week.
function weekday(n: number): CountableTimeInterval {
    // Use UTC for weeks calculation to get into account time zone shifts
    const base = Date.UTC(baseSunday.getFullYear(), baseSunday.getMonth(), baseSunday.getDate()) + n * durationDay;

    function encode(date: Date) {
        const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        return Math.floor((utc - base) / durationWeek);
    }

    function decode(encoded: number) {
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
