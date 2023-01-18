import { CountableTimeInterval } from './interval';
import { durationHour } from './duration';

function floor(date: Date) {
    date.setMinutes(0, 0, 0);
}
function offset(date: Date, hours: number) {
    date.setHours(date.getHours() + hours);
}
function stepTest(date: Date, hours: number) {
    return Math.floor(date.getTime() / durationHour) % hours === 0;
}

export const hour = new CountableTimeInterval(floor, offset, stepTest);
export default hour;
