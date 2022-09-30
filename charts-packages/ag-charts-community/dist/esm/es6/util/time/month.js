import { epochYear } from './duration';
import { CountableTimeInterval } from './interval';
function floor(date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
}
function offset(date, months) {
    date.setMonth(date.getMonth() + months);
}
function count(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}
function field(date) {
    const yearsSinceEpoch = date.getFullYear() - epochYear;
    const monthsSinceEpoch = yearsSinceEpoch * 12 + date.getMonth();
    return monthsSinceEpoch;
}
export const month = new CountableTimeInterval(floor, offset, count, field);
export default month;
