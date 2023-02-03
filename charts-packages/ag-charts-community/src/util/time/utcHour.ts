import { CountableTimeInterval } from './interval';
import { durationHour } from './duration';

const base = Date.UTC(2020, 0, 1);

function encode(date: Date) {
    return Math.floor((date.getTime() - base) / durationHour);
}

function decode(encoded: number) {
    return new Date(base + encoded * durationHour);
}

export const utcHour = new CountableTimeInterval(encode, decode);
