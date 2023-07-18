import { durationWeek } from './duration';
import { CountableTimeInterval } from './interval';
// Set date to n-th day of the week.
function weekday(n) {
    var base = new Date(2023, 0, 1 + n).getTime();
    function encode(date) {
        var dateMs = date.getTime();
        return Math.floor((dateMs - base) / durationWeek);
    }
    function decode(encoded) {
        var d = new Date(base);
        d.setDate(d.getDate() + encoded * 7);
        return d;
    }
    return new CountableTimeInterval(encode, decode);
}
export var sunday = weekday(0);
export var monday = weekday(1);
export var tuesday = weekday(2);
export var wednesday = weekday(3);
export var thursday = weekday(4);
export var friday = weekday(5);
export var saturday = weekday(6);
export default sunday;
