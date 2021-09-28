import { CountableTimeInterval } from "./interval";
function floor(date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
}
function offset(date, years) {
    date.setFullYear(date.getFullYear() + years);
}
function count(start, end) {
    return end.getFullYear() - start.getFullYear();
}
function field(date) {
    return date.getFullYear();
}
export var year = new CountableTimeInterval(floor, offset, count, field);
export default year;
