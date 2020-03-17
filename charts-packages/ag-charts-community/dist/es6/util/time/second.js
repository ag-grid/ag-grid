import { CountableTimeInterval } from "./interval";
import { durationSecond } from "./duration";
function floor(date) {
    date.setTime(date.getTime() - date.getMilliseconds());
}
function offset(date, seconds) {
    date.setTime(date.getTime() + seconds * durationSecond);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / durationSecond;
}
export var second = new CountableTimeInterval(floor, offset, count);
export default second;
