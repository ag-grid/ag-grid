import { durationWeek, durationDay } from './duration';
import { CountableTimeInterval } from './interval';
var baseSunday = new Date(2023, 0, 1);
// Set date to n-th day of the week.
function weekday(n) {
    // Use UTC for weeks calculation to get into account time zone shifts
    var base = Date.UTC(baseSunday.getFullYear(), baseSunday.getMonth(), baseSunday.getDate()) + n * durationDay;
    function encode(date) {
        var utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        return Math.floor((utc - base) / durationWeek);
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
