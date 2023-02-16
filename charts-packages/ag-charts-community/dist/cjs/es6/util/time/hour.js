"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hour = void 0;
const interval_1 = require("./interval");
const duration_1 = require("./duration");
const offset = new Date().getTimezoneOffset() * duration_1.durationMinute;
function encode(date) {
    return Math.floor((date.getTime() - offset) / duration_1.durationHour);
}
function decode(encoded) {
    return new Date(offset + encoded * duration_1.durationHour);
}
exports.hour = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.hour;
