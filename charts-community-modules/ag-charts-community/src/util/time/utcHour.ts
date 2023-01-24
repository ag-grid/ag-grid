import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setUTCMinutes(0, 0, 0);
}
function offset(date: Date, hours: number) {
    date.setUTCHours(date.getUTCHours() + hours);
}
function stepTest(date: Date, hours: number) {
    return date.getUTCHours() % hours === 0;
}

export const utcHour = new CountableTimeInterval(floor, offset, stepTest);
