import { CountableTimeInterval } from './interval';

function floor(date: Date) {
    return date;
}
function offset(date: Date, milliseconds: number) {
    date.setMilliseconds(date.getMilliseconds() + milliseconds);
}
function stepTest(date: Date, milliseconds: number) {
    return Math.floor(date.getTime()) % milliseconds === 0;
}

export const millisecond = new CountableTimeInterval(floor, offset, stepTest);
export default millisecond;
