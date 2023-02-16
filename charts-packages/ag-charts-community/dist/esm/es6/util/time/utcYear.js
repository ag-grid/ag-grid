import { CountableTimeInterval } from './interval';
function encode(date) {
    return date.getUTCFullYear();
}
function decode(encoded) {
    // Note: assigning years through the constructor
    // will break for years 0 - 99 AD (will turn 1900's).
    const d = new Date();
    d.setUTCFullYear(encoded);
    d.setUTCMonth(0, 1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
export const utcYear = new CountableTimeInterval(encode, decode);
export default utcYear;
