import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';
function encode(date) {
    var utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor(utc / durationDay);
}
function decode(encoded) {
    var d = new Date(0);
    d.setDate(d.getDate() + encoded);
    d.setHours(0, 0, 0, 0);
    return d;
}
export var day = new CountableTimeInterval(encode, decode);
export default day;
