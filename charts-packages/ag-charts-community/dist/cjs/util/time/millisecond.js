"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
function floor(date) {
    return date;
}
function offset(date, milliseconds) {
    date.setTime(date.getTime() + milliseconds);
}
function count(start, end) {
    return end.getTime() - start.getTime();
}
exports.millisecond = new interval_1.CountableTimeInterval(floor, offset, count);
exports.default = exports.millisecond;
//# sourceMappingURL=millisecond.js.map