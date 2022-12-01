import { CountableTimeInterval } from "./interval";

function floor(date: Date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date: Date, years: number) {
    date.setUTCFullYear(date.getUTCFullYear() + years);
}
function count(start: Date, end: Date): number {
    return end.getUTCFullYear() - start.getUTCFullYear();
}
function field(date: Date): number {
    return date.getUTCFullYear();
}

const utcYear = new CountableTimeInterval(floor, offset, count, field);
export default utcYear;
