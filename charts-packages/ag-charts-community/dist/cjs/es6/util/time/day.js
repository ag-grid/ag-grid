"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interval_1 = require("./interval");
const duration_1 = require("./duration");
function floor(date) {
    date.setHours(0, 0, 0, 0);
}
function offset(date, days) {
    date.setDate(date.getDate() + days);
}
function count(start, end) {
    const tzMinuteDelta = end.getTimezoneOffset() - start.getTimezoneOffset();
    return (end.getTime() - start.getTime() - tzMinuteDelta * duration_1.durationMinute) / duration_1.durationDay;
}
function field(date) {
    return Math.floor(date.getTime() / duration_1.durationDay);
}
exports.day = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.day;
