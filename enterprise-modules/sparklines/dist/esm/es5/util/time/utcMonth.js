import { CountableTimeInterval } from "./interval";
function floor(date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date, months) {
    date.setUTCMonth(date.getUTCMonth() + months);
}
function count(start, end) {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}
function field(date) {
    return date.getUTCMonth();
}
export var utcMonth = new CountableTimeInterval(floor, offset, count, field);
export default utcMonth;
