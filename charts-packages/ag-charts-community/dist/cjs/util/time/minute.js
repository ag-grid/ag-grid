"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
var duration_1 = require("./duration");
function floor(date) {
    date.setTime(date.getTime() - date.getMilliseconds() - date.getSeconds() * duration_1.durationSecond);
}
function offset(date, minutes) {
    date.setTime(date.getTime() + minutes * duration_1.durationMinute);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / duration_1.durationMinute;
}
function field(date) {
    return date.getMinutes();
}
exports.minute = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.minute;
//# sourceMappingURL=minute.js.map