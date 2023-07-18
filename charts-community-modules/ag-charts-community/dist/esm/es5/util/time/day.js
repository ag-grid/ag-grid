import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';
function encode(date) {
    var tzOffsetMs = date.getTimezoneOffset() * 60000;
    return Math.floor((date.getTime() - tzOffsetMs) / durationDay);
}
function decode(encoded) {
    var d = new Date(1970, 0, 1);
    d.setDate(d.getDate() + encoded);
    return d;
}
export var day = new CountableTimeInterval(encode, decode);
export default day;
