"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minute = void 0;
var interval_1 = require("./interval");
var duration_1 = require("./duration");
var offset = new Date().getTimezoneOffset() * duration_1.durationMinute;
function encode(date) {
    return Math.floor((date.getTime() - offset) / duration_1.durationMinute);
}
function decode(encoded) {
    return new Date(offset + encoded * duration_1.durationMinute);
}
exports.minute = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.minute;
