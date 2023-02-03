import { CountableTimeInterval } from './interval';
import { durationHour } from './duration';

const base = new Date(2020, 0, 1).getTime();

function encode(date: Date) {
    return Math.floor((date.getTime() - base) / durationHour);
}

function decode(encoded: number) {
    return new Date(base + encoded * durationHour);
}

export const hour = new CountableTimeInterval(encode, decode);
export default hour;
