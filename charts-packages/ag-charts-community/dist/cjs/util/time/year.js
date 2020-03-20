"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
function floor(date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
}
function offset(date, years) {
    date.setFullYear(date.getFullYear() + years);
}
function count(start, end) {
    return end.getFullYear() - start.getFullYear();
}
function field(date) {
    return date.getFullYear();
}
exports.year = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.year;
//# sourceMappingURL=year.js.map