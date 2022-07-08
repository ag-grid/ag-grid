"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const number_1 = require("./number");
const color_1 = require("../util/color");
function default_1(a, b) {
    if (typeof a === 'string') {
        try {
            a = color_1.Color.fromString(a);
        }
        catch (e) {
            a = color_1.Color.fromArray([0, 0, 0]);
        }
    }
    if (typeof b === 'string') {
        try {
            b = color_1.Color.fromString(b);
        }
        catch (e) {
            b = color_1.Color.fromArray([0, 0, 0]);
        }
    }
    const red = number_1.default(a.r, b.r);
    const green = number_1.default(a.g, b.g);
    const blue = number_1.default(a.b, b.b);
    const alpha = number_1.default(a.a, b.a);
    return function (t) {
        return color_1.Color.fromArray([red(t), green(t), blue(t), alpha(t)]).toRgbaString();
    };
}
exports.default = default_1;
