"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.day = void 0;
var interval_1 = require("./interval");
var duration_1 = require("./duration");
function encode(date) {
    var tzOffsetMs = date.getTimezoneOffset() * 60000;
    return Math.floor((date.getTime() - tzOffsetMs) / duration_1.durationDay);
}
function decode(encoded) {
    var d = new Date(1970, 0, 1);
    d.setDate(d.getDate() + encoded);
    return d;
}
exports.day = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.day;
//# sourceMappingURL=day.js.map