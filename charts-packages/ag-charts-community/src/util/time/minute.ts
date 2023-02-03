import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';

const base = new Date(2020, 0, 1).getTime();

function encode(date: Date) {
    return Math.floor((date.getTime() - base) / durationMinute);
}

function decode(encoded: number) {
    return new Date(base + encoded * durationMinute);
}

export const minute = new CountableTimeInterval(encode, decode);
export default minute;
