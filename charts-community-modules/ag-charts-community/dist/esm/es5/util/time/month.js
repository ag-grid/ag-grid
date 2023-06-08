import { CountableTimeInterval } from './interval';
function encode(date) {
    return date.getFullYear() * 12 + date.getMonth();
}
function decode(encoded) {
    var year = Math.floor(encoded / 12);
    var month = encoded - year * 12;
    return new Date(year, month, 1);
}
export var month = new CountableTimeInterval(encode, decode);
export default month;
