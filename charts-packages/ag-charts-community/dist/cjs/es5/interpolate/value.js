"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./constant");
var number_1 = require("./number");
var date_1 = require("./date");
var array_1 = require("./array");
var object_1 = require("./object");
var color_1 = require("./color");
var color_2 = require("../util/color");
function default_1(a, b) {
    var t = typeof b;
    var c;
    if (b == null || t === 'boolean') {
        return constant_1.default(b);
    }
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
    if (b instanceof color_2.Color) {
        return color_1.default(a, b);
    }
    if (b instanceof Date) {
        return date_1.default(a, b);
    }
    if (Array.isArray(b)) {
        return array_1.default(a, b);
    }
    if ((typeof b.valueOf !== 'function' && typeof b.toString !== 'function') || isNaN(b)) {
        return object_1.default(a, b);
    }
    return number_1.default(a, b);
}
exports.default = default_1;
