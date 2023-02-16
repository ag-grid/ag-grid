"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcDay = void 0;
const interval_1 = require("./interval");
const duration_1 = require("./duration");
function encode(date) {
    return Math.floor(date.getTime() / duration_1.durationDay);
}
function decode(encoded) {
    const d = new Date(0);
    d.setUTCDate(d.getUTCDate() + encoded);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
exports.utcDay = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.utcDay;
