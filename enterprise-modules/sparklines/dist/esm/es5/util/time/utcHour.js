import { CountableTimeInterval } from "./interval";
import { durationHour } from "./duration";
function floor(date) {
    date.setUTCMinutes(0, 0, 0);
}
function offset(date, hours) {
    date.setTime(date.getTime() + hours * durationHour);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / durationHour;
}
function field(date) {
    return date.getUTCHours();
}
export var utcHour = new CountableTimeInterval(floor, offset, count, field);
export default utcHour;
