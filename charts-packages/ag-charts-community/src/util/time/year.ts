import { durationYear } from './duration';
import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
}
function offset(date: Date, years: number) {
    date.setFullYear(date.getFullYear() + years);
}
function count(start: Date, end: Date): number {
    return end.getFullYear() - start.getFullYear();
}
function field(date: Date): number {
    return Math.floor(date.getTime() / durationYear);
}

export const year = new CountableTimeInterval(floor, offset, count, field);
export default year;
