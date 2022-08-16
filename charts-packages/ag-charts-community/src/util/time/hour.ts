import { CountableTimeInterval } from './interval';
import { durationHour, durationMinute, durationSecond } from './duration';

function floor(date: Date) {
    date.setTime(
        date.getTime() -
            date.getMilliseconds() -
            date.getSeconds() * durationSecond -
            date.getMinutes() * durationMinute
    );
}
function offset(date: Date, hours: number) {
    date.setTime(date.getTime() + hours * durationHour);
}
function count(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / durationHour;
}
function field(date: Date): number {
    return Math.floor(date.getTime() / durationHour);
}

export const hour = new CountableTimeInterval(floor, offset, count, field);
export default hour;
