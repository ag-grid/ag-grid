import { CountableTimeInterval } from './interval';
function encode(date) {
    return date.getFullYear();
}
function decode(encoded) {
    // Note: assigning years through the constructor
    // will break for years 0 - 99 AD (will turn 1900's).
    var d = new Date();
    d.setFullYear(encoded);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
}
export var year = new CountableTimeInterval(encode, decode);
export default year;
