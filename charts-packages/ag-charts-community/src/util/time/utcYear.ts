import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date: Date, years: number) {
    date.setUTCFullYear(date.getUTCFullYear() + years);
}
function stepTest(date: Date, years: number) {
    return date.getUTCFullYear() % years === 0;
}

export const utcYear = new CountableTimeInterval(floor, offset, stepTest);
export default utcYear;
