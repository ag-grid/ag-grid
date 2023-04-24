"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.millisecond = void 0;
var interval_1 = require("./interval");
function encode(date) {
    return date.getTime();
}
function decode(encoded) {
    return new Date(encoded);
}
exports.millisecond = new interval_1.CountableTimeInterval(encode, decode);
exports.default = exports.millisecond;
//# sourceMappingURL=millisecond.js.map