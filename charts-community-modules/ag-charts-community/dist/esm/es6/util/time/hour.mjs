import { CountableTimeInterval } from './interval.mjs';
import { durationHour, durationMinute } from './duration.mjs';
const offset = new Date().getTimezoneOffset() * durationMinute;
function encode(date) {
    return Math.floor((date.getTime() - offset) / durationHour);
}
function decode(encoded) {
    return new Date(offset + encoded * durationHour);
}
export const hour = new CountableTimeInterval(encode, decode);
export default hour;
