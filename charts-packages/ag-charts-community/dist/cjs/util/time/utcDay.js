"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
var duration_1 = require("./duration");
function floor(date) {
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date, days) {
    date.setUTCDate(date.getUTCDate() + days);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / duration_1.durationDay;
}
function field(date) {
    return date.getUTCDate() - 1;
}
exports.utcDay = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.utcDay;
//# sourceMappingURL=utcDay.js.map