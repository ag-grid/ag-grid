"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.day = void 0;
const interval_1 = require("./interval");
const duration_1 = require("./duration");
function encode(date) {
    const tzOffsetMs = date.getTimezoneOffset() * 60000;
    return Math.floor((date.getTime() - tzOffsetMs) / duration_1.durationDay);
}
function decode(encoded) {
    const d = new Date(1970, 0, 1);
    d.setDate(d.getDate() + encoded);
    return d;
}
exports.day = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.day;
