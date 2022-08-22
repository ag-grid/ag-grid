"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interval_1 = require("./interval");
const duration_1 = require("./duration");
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
    return Math.floor(date.getTime() / duration_1.durationMinute);
}
exports.minute = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.minute;
