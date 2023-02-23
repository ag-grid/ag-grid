import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';

function encode(date: Date) {
    const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor(utc / durationDay);
}

function decode(encoded: number) {
    const d = new Date(0);
    d.setDate(d.getDate() + encoded);
    d.setHours(0, 0, 0, 0);
    return d;
}

export const day = new CountableTimeInterval(encode, decode);
export default day;
