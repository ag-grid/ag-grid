"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./constant");
var number_1 = require("./number");
var date_1 = require("./date");
var array_1 = require("./array");
var object_1 = require("./object");
function default_1(a, b) {
    var t = typeof b;
    // let c;
    return b == null || t === 'boolean' ? constant_1.default(b)
        : (t === 'number' ? number_1.default
            // : t === 'string' ? ((c = color(b)) ? (b = c, rgb) : string)
            //     : b instanceof color ? rgb
            : b instanceof Date ? date_1.default
                : Array.isArray(b) ? array_1.default
                    : typeof b.valueOf !== 'function' && typeof b.toString !== 'function' || isNaN(b) ? object_1.default
                        : number_1.default)(a, b);
}
exports.default = default_1;
//# sourceMappingURL=value.js.map