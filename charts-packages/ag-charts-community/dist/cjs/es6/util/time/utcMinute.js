"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcMinute = void 0;
const interval_1 = require("./interval");
const duration_1 = require("./duration");
function encode(date) {
    return Math.floor(date.getTime() / duration_1.durationMinute);
}
function decode(encoded) {
    return new Date(encoded * duration_1.durationMinute);
}
exports.utcMinute = new interval_1.CountableTimeInterval(encode, decode);
