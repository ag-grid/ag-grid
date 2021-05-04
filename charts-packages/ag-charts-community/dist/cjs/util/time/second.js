"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
var duration_1 = require("./duration");
function floor(date) {
    date.setTime(date.getTime() - date.getMilliseconds());
}
function offset(date, seconds) {
    date.setTime(date.getTime() + seconds * duration_1.durationSecond);
}
function count(start, end) {
    return (end.getTime() - start.getTime()) / duration_1.durationSecond;
}
exports.second = new interval_1.CountableTimeInterval(floor, offset, count);
exports.default = exports.second;
//# sourceMappingURL=second.js.map