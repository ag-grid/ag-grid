import { CountableTimeInterval } from "./interval";
import { durationDay } from "./duration";

function floor(date: Date) {
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date: Date, days: number) {
    date.setUTCDate(date.getUTCDate() + days);
}
function count(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / durationDay;
}
function field(date: Date): number {
    return date.getUTCDate() - 1;
}

const utcDay = new CountableTimeInterval(floor, offset, count, field);
export default utcDay;
