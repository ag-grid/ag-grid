"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
var duration_1 = require("./duration");
function floor(date) {
    date.setTime(date.getTime() - date.getMilliseconds() - date.getSeconds() * duration_1.durationSecond - date.getMinutes() * duration_1.durationMinute);
}
function offset(date, hours) {
    date.setTime(date.getTime() + hours * duration_1.durationHour);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / duration_1.durationHour;
}
function field(date) {
    return date.getHours();
}
exports.hour = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.hour;
//# sourceMappingURL=hour.js.map