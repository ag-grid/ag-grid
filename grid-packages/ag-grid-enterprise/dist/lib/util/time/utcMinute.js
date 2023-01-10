"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcMinute = void 0;
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
//# sourceMappingURL=utcMinute.js.map