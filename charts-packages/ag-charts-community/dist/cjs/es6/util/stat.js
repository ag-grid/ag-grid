"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linearRegression = void 0;
/**
 * Returns `{slope, intercept}` for `y = slope * x + intercept` given two arrays of variables.
 * @param X Array of independent variables.
 * @param Y Array of dependent variables.
 */
function linearRegression(X, Y) {
    const n = X.length;
    if (!n || n !== Y.length) {
        return;
    }
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumXY = 0;
    for (let i = 0; i < n; i++) {
        const x = X[i];
        const y = Y[i];
        if (isNaN(x) || !isFinite(x)) {
            return;
        }
        if (isNaN(y) || !isFinite(y)) {
            return;
        }
        sumX += x;
        sumY += y;
        sumXX += x * x;
        sumXY += x * y;
    }
    const denominator = n * sumXX - sumX * sumX;
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY * sumXX - sumX * sumXY) / denominator;
    return { slope, intercept };
}
exports.linearRegression = linearRegression;
