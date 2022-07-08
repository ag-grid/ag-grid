"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var number_1 = require("./number");
var color_1 = require("../util/color");
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
    var red = number_1.default(a.r, b.r);
    var green = number_1.default(a.g, b.g);
    var blue = number_1.default(a.b, b.b);
    var alpha = number_1.default(a.a, b.a);
    return function (t) {
        return color_1.Color.fromArray([red(t), green(t), blue(t), alpha(t)]).toRgbaString();
    };
}
exports.default = default_1;
