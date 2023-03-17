import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';
function encode(date) {
    return Math.floor(date.getTime() / durationMinute);
}
function decode(encoded) {
    return new Date(encoded * durationMinute);
}
export var utcMinute = new CountableTimeInterval(encode, decode);
