import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';

function floor(date: Date) {
    date.setSeconds(0, 0);
}
function offset(date: Date, minutes: number) {
    date.setMinutes(date.getMinutes() + minutes);
}
function stepTest(date: Date, minutes: number) {
    return Math.floor(date.getTime() / durationMinute) % minutes === 0;
}

export const minute = new CountableTimeInterval(floor, offset, stepTest);
export default minute;
