"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const number_1 = require("./number");
const color_1 = require("./color");
const color_2 = require("../util/color");
function default_1(a, b) {
    const t = typeof b;
    let c;
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
