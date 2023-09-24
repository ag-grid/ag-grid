import { CountableTimeInterval } from './interval.mjs';
import { durationDay } from './duration.mjs';
function encode(date) {
    const tzOffsetMs = date.getTimezoneOffset() * 60000;
    return Math.floor((date.getTime() - tzOffsetMs) / durationDay);
}
function decode(encoded) {
    const d = new Date(1970, 0, 1);
    d.setDate(d.getDate() + encoded);
    return d;
}
export const day = new CountableTimeInterval(encode, decode);
export default day;
