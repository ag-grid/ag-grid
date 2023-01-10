import { CountableTimeInterval } from './interval';
import { durationMinute } from './duration';
function floor(date) {
    date.setUTCSeconds(0, 0);
}
function offset(date, minutes) {
    date.setTime(date.getTime() + minutes * durationMinute);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / durationMinute;
}
function field(date) {
    return date.getUTCMinutes();
}
export const utcMinute = new CountableTimeInterval(floor, offset, count, field);
