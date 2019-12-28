import { CountableTimeInterval } from "./interval";
import { durationSecond } from "./duration";

function floor(date: Date) {
    date.setTime(date.getTime() - date.getMilliseconds());
}
function offset(date: Date, seconds: number) {
    date.setTime(date.getTime() + seconds * durationSecond);
}
function count(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / durationSecond;
}

const second = new CountableTimeInterval(floor, offset, count);
export default second;
