"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("./value");
function default_1(a, b) {
    const nb = b ? b.length : 0;
    const na = a ? Math.min(nb, a.length) : 0;
    const x = new Array(na);
    const c = new Array(nb);
    let i;
    for (i = 0; i < na; ++i) {
        x[i] = value_1.default(a[i], b[i]);
    }
    for (; i < nb; ++i) {
        c[i] = b[i];
    }
    return function (t) {
        for (i = 0; i < na; ++i) {
            c[i] = x[i](t);
        }
        return c;
    };
}
exports.default = default_1;
