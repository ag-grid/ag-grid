import interpolate from '../interpolate/value';
function createEase(fn) {
    return function (_a) {
        var from = _a.from, to = _a.to;
        var interp = interpolate(from, to);
        return function (time) { return interp(fn(time)); };
    };
}
export function linear(_a) {
    var from = _a.from, to = _a.to;
    return interpolate(from, to);
}
// https://easings.net/
export var easeIn = createEase(function (x) { return 1 - Math.cos((x * Math.PI) / 2); });
export var easeOut = createEase(function (x) { return Math.sin((x * Math.PI) / 2); });
export var easeInOut = createEase(function (x) { return -(Math.cos(x * Math.PI) - 1) / 2; });
export var easeOutElastic = createEase(function (x) {
    if (x === 0 || x === 1)
        return x;
    var scale = Math.pow(2, -10 * x);
    var position = x * 10 - 0.75;
    var arc = (2 * Math.PI) / 3;
    return scale * Math.sin(position * arc) + 1;
});
