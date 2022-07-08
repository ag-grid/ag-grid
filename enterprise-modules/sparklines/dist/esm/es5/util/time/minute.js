import { CountableTimeInterval } from "./interval";
import { durationMinute, durationSecond } from "./duration";
function floor(date) {
    date.setTime(date.getTime() - date.getMilliseconds() - date.getSeconds() * durationSecond);
}
function offset(date, minutes) {
    date.setTime(date.getTime() + minutes * durationMinute);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / durationMinute;
}
function field(date) {
    return date.getMinutes();
}
export var minute = new CountableTimeInterval(floor, offset, count, field);
export default minute;
