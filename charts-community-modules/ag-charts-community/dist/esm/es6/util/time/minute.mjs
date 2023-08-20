import { CountableTimeInterval } from './interval.mjs';
import { durationMinute } from './duration.mjs';
const offset = new Date().getTimezoneOffset() * durationMinute;
function encode(date) {
    return Math.floor((date.getTime() - offset) / durationMinute);
}
function decode(encoded) {
    return new Date(offset + encoded * durationMinute);
}
export const minute = new CountableTimeInterval(encode, decode);
export default minute;
