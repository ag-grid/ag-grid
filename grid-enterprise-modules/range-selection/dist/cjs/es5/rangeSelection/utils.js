"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLineByLeastSquares = void 0;
function findLineByLeastSquares(values) {
    var len = values.length;
    var maxDecimals = 0;
    if (len <= 1) {
        return values;
    }
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        var splitExponent = value.toString().split('e-');
        if (splitExponent.length > 1) {
            maxDecimals = Math.max(maxDecimals, parseInt(splitExponent[1], 10));
            continue;
        }
        if (Math.floor(value) === value) {
            continue;
        }
        maxDecimals = Math.max(maxDecimals, value.toString().split('.')[1].length);
    }
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var y = 0;
    for (var x = 0; x < len; x++) {
        y = values[x];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
    }
    var m = (len * sum_xy - sum_x * sum_y) / (len * sum_xx - sum_x * sum_x);
    var b = (sum_y / len) - (m * sum_x) / len;
    var result = [];
    for (var x = 0; x <= len; x++) {
        result.push(parseFloat((x * m + b).toFixed(maxDecimals)));
    }
    return result;
}
exports.findLineByLeastSquares = findLineByLeastSquares;
