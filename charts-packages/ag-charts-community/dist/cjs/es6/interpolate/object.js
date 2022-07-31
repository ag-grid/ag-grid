"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("./value");
function default_1(a, b) {
    const i = {};
    const c = {};
    let k;
    if (a === null || typeof a !== 'object') {
        a = {};
    }
    if (b === null || typeof b !== 'object') {
        b = {};
    }
    for (k in b) {
        if (k in a) {
            i[k] = value_1.default(a[k], b[k]);
        }
        else {
            c[k] = b[k];
        }
    }
    return (t) => {
        for (k in i) {
            c[k] = i[k](t);
        }
        return c;
    };
}
exports.default = default_1;
