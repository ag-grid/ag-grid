import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';
function encode(date) {
    return Math.floor(date.getTime() / durationDay);
}
function decode(encoded) {
    var d = new Date(0);
    d.setUTCDate(d.getUTCDate() + encoded);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
export var utcDay = new CountableTimeInterval(encode, decode);
export default utcDay;
