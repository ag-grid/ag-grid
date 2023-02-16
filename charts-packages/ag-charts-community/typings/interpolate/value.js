"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var number_1 = require("./number");
var color_1 = require("./color");
var color_2 = require("../util/color");
function default_1(a, b) {
    var t = typeof b;
    var c;
    if (t === 'number') {
        return number_1.default(a, b);
    }
    if (t === 'string') {
        try {
            c = color_2.Color.fromString(b);
            b = c;
            return color_1.default(a, b);
        }
        catch (e) { }
    }
    throw new Error('Unable to interpolate values');
}
exports.default = default_1;
//# sourceMappingURL=value.js.map