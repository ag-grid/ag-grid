"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(a, b) {
    a = +a;
    b = +b;
    return t => a * (1 - t) + b * t;
}
exports.default = default_1;
