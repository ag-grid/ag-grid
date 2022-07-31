import { CountableTimeInterval } from "./interval";
import { durationDay } from "./duration";
function floor(date) {
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date, days) {
    date.setUTCDate(date.getUTCDate() + days);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / durationDay;
}
function field(date) {
    return date.getUTCDate() - 1;
}
export var utcDay = new CountableTimeInterval(floor, offset, count, field);
export default utcDay;
