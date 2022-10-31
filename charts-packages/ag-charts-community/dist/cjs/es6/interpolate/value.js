"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
const number_1 = require("./number");
const date_1 = require("./date");
const array_1 = require("./array");
const object_1 = require("./object");
const color_1 = require("./color");
const color_2 = require("../util/color");
function default_1(a, b) {
    const t = typeof b;
    let c;
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
