import { CountableTimeInterval } from './interval';

function encode(date: Date) {
    return date.getFullYear() * 12 + date.getMonth();
}

function decode(encoded: number) {
    const year = Math.floor(encoded / 12);
    const month = encoded - year * 12;
    return new Date(year, month, 1);
}

export const month = new CountableTimeInterval(encode, decode);
export default month;
