import { CountableTimeInterval } from "./interval";
function floor(date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date, years) {
    date.setUTCFullYear(date.getUTCFullYear() + years);
}
function count(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
}
function field(date) {
    return date.getUTCFullYear();
}
export var utcYear = new CountableTimeInterval(floor, offset, count, field);
export default utcYear;
