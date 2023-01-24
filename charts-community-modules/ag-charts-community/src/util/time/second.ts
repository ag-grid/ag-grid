import { CountableTimeInterval } from './interval';
import { durationSecond } from './duration';

function floor(date: Date) {
    date.setMilliseconds(0);
}
function offset(date: Date, seconds: number) {
    date.setSeconds(date.getSeconds() + seconds);
}
function stepTest(date: Date, seconds: number) {
    return Math.floor(date.getTime() / durationSecond) % seconds === 0;
}

export const second = new CountableTimeInterval(floor, offset, stepTest);
export default second;
