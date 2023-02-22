import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';

const offset = new Date().getTimezoneOffset() * durationMinute;

function encode(date: Date) {
    return Math.floor((date.getTime() - offset) / durationMinute);
}

function decode(encoded: number) {
    return new Date(offset + encoded * durationMinute);
}

export const minute = new CountableTimeInterval(encode, decode);
export default minute;
