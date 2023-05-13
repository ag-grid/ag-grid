import { CountableTimeInterval } from './interval';
import { durationWeek, durationDay } from './duration';
var baseSunday = Date.UTC(2023, 0, 1);
// Set date to n-th day of the week.
function weekday(n) {
    var base = new Date(baseSunday + n * durationDay).getTime();
    function encode(date) {
        return Math.floor((date.getTime() - base) / durationWeek);
    }
    function decode(encoded) {
        var d = new Date(base);
        d.setUTCDate(d.getUTCDate() + encoded * 7);
        d.setUTCHours(0, 0, 0, 0);
        return d;
    }
    return new CountableTimeInterval(encode, decode);
}
export var utcSunday = weekday(0);
export var utcMonday = weekday(1);
export var utcTuesday = weekday(2);
export var utcWednesday = weekday(3);
export var utcThursday = weekday(4);
export var utcFriday = weekday(5);
export var utcSaturday = weekday(6);
