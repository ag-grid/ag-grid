import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date: Date, days: number) {
    date.setUTCDate(date.getUTCDate() + days);
}
function stepTest(date: Date, days: number) {
    return (date.getUTCDate() - 1) % days === 0;
}

export const utcDay = new CountableTimeInterval(floor, offset, stepTest);
export default utcDay;
