import { CountableTimeInterval } from "./interval";

export default function millisecond(): CountableTimeInterval {
    function offset(date: Date, milliseconds: number) {
        date.setTime(date.getTime() + milliseconds);
    }
    function count(start: Date, end: Date): number {
        return end.getTime() - start.getTime();
    }

    return new CountableTimeInterval(d => d, offset, count);
}
