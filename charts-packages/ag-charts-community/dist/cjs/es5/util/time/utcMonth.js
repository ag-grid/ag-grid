"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcMonth = void 0;
var interval_1 = require("./interval");
function encode(date) {
    return date.getUTCFullYear() * 12 + date.getUTCMonth();
}
function decode(encoded) {
    var year = Math.floor(encoded / 12);
    var month = encoded - year * 12;
    return new Date(Date.UTC(year, month, 1));
}
exports.utcMonth = new interval_1.CountableTimeInterval(encode, decode);
