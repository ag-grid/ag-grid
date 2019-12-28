import { CountableTimeInterval } from "./interval";
import { durationHour, durationMinute, durationSecond } from "./duration";

function floor(date: Date) {
    date.setUTCMinutes(0, 0, 0);
}
function offset(date: Date, hours: number) {
    date.setTime(date.getTime() + hours * durationHour);
}
function count(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / durationHour;
}
function field(date: Date): number {
    return date.getUTCHours();
}

const utcHour = new CountableTimeInterval(floor, offset, count, field);
export default utcHour;
