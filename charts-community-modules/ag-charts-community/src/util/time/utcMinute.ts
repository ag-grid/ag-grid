import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';

function encode(date: Date) {
    return Math.floor(date.getTime() / durationMinute);
}

function decode(encoded: number) {
    return new Date(encoded * durationMinute);
}

export const utcMinute = new CountableTimeInterval(encode, decode);
