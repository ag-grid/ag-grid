"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var value_1 = require("./value");
function default_1(a, b) {
    var i = {};
    var c = {};
    var k;
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
    return function (t) {
        for (k in i) {
            c[k] = i[k](t);
        }
        return c;
    };
}
exports.default = default_1;
//# sourceMappingURL=object.js.map