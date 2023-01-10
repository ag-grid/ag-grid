"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcThursday = exports.utcMonday = exports.utcSunday = void 0;
const duration_1 = require("./duration");
const interval_1 = require("./interval");
// Set date to n-th day of the week.
function weekday(n) {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date) {
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 7 - n) % 7));
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date, weeks) {
        date.setUTCDate(date.getUTCDate() + weeks * 7);
    }
    // Count the number of weeks between the start and end dates.
    function count(start, end) {
        return (end.getTime() - start.getTime()) / duration_1.durationWeek;
    }
    return new interval_1.CountableTimeInterval(floor, offset, count);
}
exports.utcSunday = weekday(0);
exports.utcMonday = weekday(1);
exports.utcThursday = weekday(4);
