"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcHour = void 0;
const interval_1 = require("./interval");
const duration_1 = require("./duration");
function floor(date) {
    date.setUTCMinutes(0, 0, 0);
}
function offset(date, hours) {
    date.setTime(date.getTime() + hours * duration_1.durationHour);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / duration_1.durationHour;
}
function field(date) {
    return date.getUTCHours();
}
exports.utcHour = new interval_1.CountableTimeInterval(floor, offset, count, field);
