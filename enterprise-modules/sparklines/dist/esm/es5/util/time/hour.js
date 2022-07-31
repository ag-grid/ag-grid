import { CountableTimeInterval } from "./interval";
import { durationHour, durationMinute, durationSecond } from "./duration";
function floor(date) {
    date.setTime(date.getTime() - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}
function offset(date, hours) {
    date.setTime(date.getTime() + hours * durationHour);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / durationHour;
}
function field(date) {
    return date.getHours();
}
export var hour = new CountableTimeInterval(floor, offset, count, field);
export default hour;
