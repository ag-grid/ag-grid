import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
}
function offset(date: Date, months: number) {
    date.setMonth(date.getMonth() + months);
}
function stepTest(date: Date, months: number) {
    return (date.getFullYear() * 12 + date.getMonth()) % months === 0;
}

export const month = new CountableTimeInterval(floor, offset, stepTest);
export default month;
