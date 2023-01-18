import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setUTCSeconds(0, 0);
}
function offset(date: Date, minutes: number) {
    date.setUTCMinutes(date.getUTCMinutes() + minutes);
}
function stepTest(date: Date, minutes: number) {
    return date.getUTCMinutes() % minutes === 0;
}

export const utcMinute = new CountableTimeInterval(floor, offset, stepTest);
