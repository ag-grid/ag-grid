"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easeOutElastic = exports.easeInOut = exports.easeOut = exports.easeIn = exports.linear = void 0;
const value_1 = require("../interpolate/value");
function createEase(fn) {
    return ({ from, to }) => {
        const interp = value_1.default(from, to);
        return (time) => interp(fn(time));
    };
}
function linear({ from, to }) {
    return value_1.default(from, to);
}
exports.linear = linear;
// https://easings.net/
exports.easeIn = createEase((x) => 1 - Math.cos((x * Math.PI) / 2));
exports.easeOut = createEase((x) => Math.sin((x * Math.PI) / 2));
exports.easeInOut = createEase((x) => -(Math.cos(x * Math.PI) - 1) / 2);
exports.easeOutElastic = createEase((x) => {
    if (x === 0 || x === 1)
        return x;
    const scale = Math.pow(2, -10 * x);
    const position = x * 10 - 0.75;
    const arc = (2 * Math.PI) / 3;
    return scale * Math.sin(position * arc) + 1;
});
