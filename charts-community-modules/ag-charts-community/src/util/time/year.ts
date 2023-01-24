import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
}
function offset(date: Date, years: number) {
    date.setFullYear(date.getFullYear() + years);
}
function stepTest(date: Date, years: number) {
    return date.getFullYear() % years === 0;
}

export const year = new CountableTimeInterval(floor, offset, stepTest);
export default year;
