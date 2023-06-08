import { CountableTimeInterval } from './interval';
function encode(date) {
    return date.getUTCFullYear() * 12 + date.getUTCMonth();
}
function decode(encoded) {
    var year = Math.floor(encoded / 12);
    var month = encoded - year * 12;
    return new Date(Date.UTC(year, month, 1));
}
export var utcMonth = new CountableTimeInterval(encode, decode);
