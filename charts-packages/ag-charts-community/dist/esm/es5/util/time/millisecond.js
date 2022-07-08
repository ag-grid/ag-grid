import { CountableTimeInterval } from "./interval";
function floor(date) {
    return date;
}
function offset(date, milliseconds) {
    date.setTime(date.getTime() + milliseconds);
}
function count(start, end) {
    return end.getTime() - start.getTime();
}
export var millisecond = new CountableTimeInterval(floor, offset, count);
export default millisecond;
