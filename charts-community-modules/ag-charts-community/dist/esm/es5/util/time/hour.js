import { CountableTimeInterval } from './interval';
import { durationHour, durationMinute } from './duration';
var offset = new Date().getTimezoneOffset() * durationMinute;
function encode(date) {
    return Math.floor((date.getTime() - offset) / durationHour);
}
function decode(encoded) {
    return new Date(offset + encoded * durationHour);
}
export var hour = new CountableTimeInterval(encode, decode);
export default hour;
