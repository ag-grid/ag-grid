import { CountableTimeInterval } from "./interval";
import { durationDay, durationMinute } from "./duration";
function floor(date) {
    date.setHours(0, 0, 0, 0);
}
function offset(date, days) {
    date.setDate(date.getDate() + days);
}
function count(start, end) {
    var tzMinuteDelta = end.getTimezoneOffset() - start.getTimezoneOffset();
    return (end.getTime() - start.getTime() - tzMinuteDelta * durationMinute) / durationDay;
}
function field(date) {
    return date.getDate() - 1;
}
export var day = new CountableTimeInterval(floor, offset, count, field);
export default day;
