import { CountableTimeInterval } from './interval';
import { durationDay } from './duration';

function floor(date: Date) {
    date.setHours(0, 0, 0, 0);
}
function offset(date: Date, days: number) {
    date.setDate(date.getDate() + days);
}
function stepTest(date: Date, days: number) {
    return Math.floor(date.getTime() / durationDay) % days === 0;
}

export const day = new CountableTimeInterval(floor, offset, stepTest);
export default day;
