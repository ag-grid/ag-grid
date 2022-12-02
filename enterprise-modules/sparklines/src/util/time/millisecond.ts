import { CountableTimeInterval } from "./interval";

function floor(date: Date) {
    return date;
}
function offset(date: Date, milliseconds: number) {
    date.setTime(date.getTime() + milliseconds);
}
function count(start: Date, end: Date): number {
    return end.getTime() - start.getTime();
}

const millisecond = new CountableTimeInterval(floor, offset, count);
export default millisecond;
