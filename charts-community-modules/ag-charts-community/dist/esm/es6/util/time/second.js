import { CountableTimeInterval } from './interval';
import { durationSecond, durationMinute } from './duration';
const offset = new Date().getTimezoneOffset() * durationMinute;
function encode(date) {
    return Math.floor((date.getTime() - offset) / durationSecond);
}
function decode(encoded) {
    return new Date(offset + encoded * durationSecond);
}
export const second = new CountableTimeInterval(encode, decode);
export default second;
