import { CountableTimeInterval } from './interval';
function encode(date) {
    return date.getTime();
}
function decode(encoded) {
    return new Date(encoded);
}
export const millisecond = new CountableTimeInterval(encode, decode);
export default millisecond;
