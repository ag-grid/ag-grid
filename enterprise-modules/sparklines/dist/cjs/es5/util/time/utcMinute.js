"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
var duration_1 = require("./duration");
function floor(date) {
    date.setUTCSeconds(0, 0);
}
function offset(date, minutes) {
    date.setTime(date.getTime() + minutes * duration_1.durationMinute);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / duration_1.durationMinute;
}
function field(date) {
    return date.getUTCMinutes();
}
exports.utcMinute = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.utcMinute;
//# sourceMappingURL=utcMinute.js.map