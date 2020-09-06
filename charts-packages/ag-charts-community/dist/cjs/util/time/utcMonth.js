"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
function floor(date) {
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date, months) {
    date.setUTCMonth(date.getUTCMonth() + months);
}
function count(start, end) {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}
function field(date) {
    return date.getUTCMonth();
}
exports.utcMonth = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.utcMonth;
//# sourceMappingURL=utcMonth.js.map