import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';

function encode(date: Date) {
    const tzOffsetMs = date.getTimezoneOffset() * 60_000;

    return Math.floor((date.getTime() - tzOffsetMs) / durationDay);
}

function decode(encoded: number) {
    const d = new Date(0);
    const startTzOffsetMs = d.getTimezoneOffset() * 60_000;
    d.setTime(d.getTime() + startTzOffsetMs);
    d.setDate(d.getDate() + encoded);

    return d;
}

export const day = new CountableTimeInterval(encode, decode);
export default day;
