"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hour = void 0;
const interval_1 = require("./interval");
const duration_1 = require("./duration");
function floor(date) {
    date.setTime(date.getTime() -
        date.getMilliseconds() -
        date.getSeconds() * duration_1.durationSecond -
        date.getMinutes() * duration_1.durationMinute);
}
function offset(date, hours) {
    date.setTime(date.getTime() + hours * duration_1.durationHour);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / duration_1.durationHour;
}
function field(date) {
    return Math.floor(date.getTime() / duration_1.durationHour);
}
exports.hour = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.hour;
