"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcYear = void 0;
const interval_1 = require("./interval");
function encode(date) {
    return date.getUTCFullYear();
}
function decode(encoded) {
    // Note: assigning years through the constructor
    // will break for years 0 - 99 AD (will turn 1900's).
    const d = new Date();
    d.setUTCFullYear(encoded);
    d.setUTCMonth(0, 1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
exports.utcYear = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.utcYear;
