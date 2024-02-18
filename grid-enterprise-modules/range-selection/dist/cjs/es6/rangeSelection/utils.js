"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLineByLeastSquares = void 0;
function findLineByLeastSquares(values) {
    const len = values.length;
    let maxDecimals = 0;
    if (len <= 1) {
        return values;
    }
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const splitExponent = value.toString().split('e-');
        if (splitExponent.length > 1) {
            maxDecimals = Math.max(maxDecimals, parseInt(splitExponent[1], 10));
            continue;
        }
        if (Math.floor(value) === value) {
            continue;
        }
        maxDecimals = Math.max(maxDecimals, value.toString().split('.')[1].length);
    }
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let y = 0;
    for (let x = 0; x < len; x++) {
        y = values[x];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
    }
    const m = (len * sum_xy - sum_x * sum_y) / (len * sum_xx - sum_x * sum_x);
    const b = (sum_y / len) - (m * sum_x) / len;
    const result = [];
    for (let x = 0; x <= len; x++) {
        result.push(parseFloat((x * m + b).toFixed(maxDecimals)));
    }
    return result;
}
exports.findLineByLeastSquares = findLineByLeastSquares;
