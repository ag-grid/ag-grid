"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.year = void 0;
const interval_1 = require("./interval");
function encode(date) {
    return date.getFullYear();
}
function decode(encoded) {
    // Note: assigning years through the constructor
    // will break for years 0 - 99 AD (will turn 1900's).
    const d = new Date();
    d.setFullYear(encoded);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
}
exports.year = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.year;
