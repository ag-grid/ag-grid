"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interval_1 = require("./interval");
function floor(date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date, years) {
    date.setUTCFullYear(date.getUTCFullYear() + years);
}
function count(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
}
function field(date) {
    return date.getUTCFullYear();
}
exports.utcYear = new interval_1.CountableTimeInterval(floor, offset, count, field);
exports.default = exports.utcYear;
//# sourceMappingURL=utcYear.js.map