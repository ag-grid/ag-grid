"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcSaturday = exports.utcFriday = exports.utcThursday = exports.utcWednesday = exports.utcTuesday = exports.utcMonday = exports.utcSunday = void 0;
var interval_1 = require("./interval");
var duration_1 = require("./duration");
var baseSunday = Date.UTC(2023, 0, 1);
// Set date to n-th day of the week.
function weekday(n) {
    var base = new Date(baseSunday + n * duration_1.durationDay).getTime();
    function encode(date) {
        return Math.floor((date.getTime() - base) / duration_1.durationWeek);
    }
    function decode(encoded) {
        var d = new Date(base);
        d.setUTCDate(d.getUTCDate() + encoded * 7);
        d.setUTCHours(0, 0, 0, 0);
        return d;
    }
    return new interval_1.CountableTimeInterval(encode, decode);
}
exports.utcSunday = weekday(0);
exports.utcMonday = weekday(1);
exports.utcTuesday = weekday(2);
exports.utcWednesday = weekday(3);
exports.utcThursday = weekday(4);
exports.utcFriday = weekday(5);
exports.utcSaturday = weekday(6);
//# sourceMappingURL=utcWeek.js.map