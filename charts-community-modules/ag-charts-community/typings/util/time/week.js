"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saturday = exports.friday = exports.thursday = exports.wednesday = exports.tuesday = exports.monday = exports.sunday = void 0;
var duration_1 = require("./duration");
var interval_1 = require("./interval");
// Set date to n-th day of the week.
function weekday(n) {
    var base = new Date(2023, 0, 1 + n).getTime();
    function encode(date) {
        var dateMs = date.getTime();
        return Math.floor((dateMs - base) / duration_1.durationWeek);
    }
    function decode(encoded) {
        var d = new Date(base);
        d.setDate(d.getDate() + encoded * 7);
        return d;
    }
    return new interval_1.CountableTimeInterval(encode, decode);
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