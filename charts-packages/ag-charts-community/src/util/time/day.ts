import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';

// Use UTC for days calculation to get into account time zone shifts
const base = Date.UTC(2020, 0, 1);

function encode(date: Date) {
    const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor((utc - base) / durationDay);
}

function decode(encoded: number) {
    const d = new Date(base);
    d.setDate(d.getDate() + encoded);
    d.setHours(0, 0, 0, 0);
    return d;
}

export const day = new CountableTimeInterval(encode, decode);
export default day;
