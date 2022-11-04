import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date: Date, months: number) {
    date.setUTCMonth(date.getUTCMonth() + months);
}
function count(start: Date, end: Date): number {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}
function field(date: Date): number {
    return date.getUTCMonth();
}

export const utcMonth = new CountableTimeInterval(floor, offset, count, field);
