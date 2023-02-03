import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';

const base = Date.UTC(2020, 0, 1);

function encode(date: Date) {
    return Math.floor((date.getTime() - base) / durationDay);
}

function decode(encoded: number) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + encoded);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

export const utcDay = new CountableTimeInterval(encode, decode);
export default utcDay;
