import { CountableTimeInterval } from './interval';
import { durationSecond } from './duration';

const base = new Date(2020, 0, 1).getTime();

function encode(date: Date) {
    return Math.floor((date.getTime() - base) / durationSecond);
}

function decode(encoded: number) {
    return new Date(base + encoded * durationSecond);
}

export const second = new CountableTimeInterval(encode, decode);
export default second;
