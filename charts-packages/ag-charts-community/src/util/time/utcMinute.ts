import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';

const base = Date.UTC(2020, 0, 1);

function encode(date: Date) {
    return Math.floor((date.getTime() - base) / durationMinute);
}

function decode(encoded: number) {
    return new Date(base + encoded * durationMinute);
}

export const utcMinute = new CountableTimeInterval(encode, decode);
