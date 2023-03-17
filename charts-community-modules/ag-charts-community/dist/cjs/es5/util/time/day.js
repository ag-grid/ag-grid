"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.day = void 0;
var interval_1 = require("./interval");
var duration_1 = require("./duration");
function encode(date) {
    var utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor(utc / duration_1.durationDay);
}
function decode(encoded) {
    var d = new Date(0);
    d.setDate(d.getDate() + encoded);
    d.setHours(0, 0, 0, 0);
    return d;
}
exports.day = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.day;
