import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date: Date, months: number) {
    date.setUTCMonth(date.getUTCMonth() + months);
}
function stepTest(date: Date, months: number) {
    return date.getUTCMonth() % months === 0;
}

export const utcMonth = new CountableTimeInterval(floor, offset, stepTest);
