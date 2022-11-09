import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';

function floor(date: Date) {
    date.setUTCSeconds(0, 0);
}
function offset(date: Date, minutes: number) {
    date.setTime(date.getTime() + minutes * durationMinute);
}
function count(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / durationMinute;
}
function field(date: Date): number {
    return date.getUTCMinutes();
}

export const utcMinute = new CountableTimeInterval(floor, offset, count, field);
