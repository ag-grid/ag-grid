"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(a, b) {
    const date = new Date;
    const msA = +a;
    const msB = +b;
    return function (t) {
        date.setTime(msA * (1 - t) + msB * t);
        return date;
    };
}
exports.default = default_1;
