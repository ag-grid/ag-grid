"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.easeOutElastic = exports.easeInOut = exports.easeOut = exports.easeIn = exports.linear = void 0;
var value_1 = require("../interpolate/value");
function createEase(fn) {
    return function (_a) {
        var from = _a.from, to = _a.to;
        var interp = value_1.default(from, to);
        return function (time) { return interp(fn(time)); };
    };
}
function linear(_a) {
    var from = _a.from, to = _a.to;
    return value_1.default(from, to);
}
exports.linear = linear;
// https://easings.net/
exports.easeIn = createEase(function (x) { return 1 - Math.cos((x * Math.PI) / 2); });
exports.easeOut = createEase(function (x) { return Math.sin((x * Math.PI) / 2); });
exports.easeInOut = createEase(function (x) { return -(Math.cos(x * Math.PI) - 1) / 2; });
exports.easeOutElastic = createEase(function (x) {
    if (x === 0 || x === 1)
        return x;
    var scale = Math.pow(2, -10 * x);
    var position = x * 10 - 0.75;
    var arc = (2 * Math.PI) / 3;
    return scale * Math.sin(position * arc) + 1;
});
//# sourceMappingURL=easing.js.map