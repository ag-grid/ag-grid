import { CountableTimeInterval } from './interval';
import { durationMinute, durationSecond } from './duration';

function floor(date: Date) {
    date.setTime(date.getTime() - date.getMilliseconds() - date.getSeconds() * durationSecond);
}
function offset(date: Date, minutes: number) {
    date.setTime(date.getTime() + minutes * durationMinute);
}
function count(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / durationMinute;
}
function field(date: Date): number {
    return Math.floor(date.getTime() / durationMinute);
}

export const minute = new CountableTimeInterval(floor, offset, count, field);
export default minute;
