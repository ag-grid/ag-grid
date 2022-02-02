"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var duration_1 = require("./duration");
var interval_1 = require("./interval");
// Set date to n-th day of the week.
function weekday(n) {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date) {
        //                  1..31            1..7
        date.setDate(date.getDate() - (date.getDay() + 7 - n) % 7);
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date, weeks) {
        date.setDate(date.getDate() + weeks * 7);
    }
    // Count the number of weeks between the start and end dates.
    function count(start, end) {
        var msDelta = end.getTime() - start.getTime();
        var tzMinuteDelta = end.getTimezoneOffset() - start.getTimezoneOffset();
        return (msDelta - tzMinuteDelta * duration_1.durationMinute) / duration_1.durationWeek;
    }
    return new interval_1.CountableTimeInterval(floor, offset, count);
}
exports.sunday = weekday(0);
exports.monday = weekday(1);
exports.tuesday = weekday(2);
exports.wednesday = weekday(3);
exports.thursday = weekday(4);
exports.friday = weekday(5);
exports.saturday = weekday(6);
exports.default = exports.sunday;
//# sourceMappingURL=week.js.map