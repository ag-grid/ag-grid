import { CountableTimeInterval } from './interval';
import { durationHour } from './duration';

function encode(date: Date) {
    return Math.floor(date.getTime() / durationHour);
}

function decode(encoded: number) {
    return new Date(encoded * durationHour);
}

export const utcHour = new CountableTimeInterval(encode, decode);
