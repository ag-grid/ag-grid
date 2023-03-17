import { CountableTimeInterval } from './interval';
import { durationSecond, durationMinute } from './duration';
var offset = new Date().getTimezoneOffset() * durationMinute;
function encode(date) {
    return Math.floor((date.getTime() - offset) / durationSecond);
}
function decode(encoded) {
    return new Date(offset + encoded * durationSecond);
}
export var second = new CountableTimeInterval(encode, decode);
export default second;
