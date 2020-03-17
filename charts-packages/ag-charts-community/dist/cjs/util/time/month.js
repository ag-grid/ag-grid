"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
function floor(date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
}
function offset(date, months) {
    date.setMonth(date.getMonth() + months);
}
function count(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}
function field(date) {
    return date.getMonth();
}
exports.month = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.month;
//# sourceMappingURL=month.js.map