import { CountableTimeInterval } from './interval.mjs';
import { durationMinute } from './duration.mjs';
function encode(date) {
    return Math.floor(date.getTime() / durationMinute);
}
function decode(encoded) {
    return new Date(encoded * durationMinute);
}
export const utcMinute = new CountableTimeInterval(encode, decode);
