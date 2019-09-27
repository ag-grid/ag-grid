// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns `{slope, intercept}` for `y = slope * x + intercept` given two arrays of variables.
 * @param X Array of independent variables.
 * @param Y Array of dependent variables.
 */
function linearRegression(X, Y) {
    var n = X.length;
    if (!n || n !== Y.length) {
        return;
    }
    var sumX = 0;
    var sumY = 0;
    var sumXX = 0;
    var sumXY = 0;
    for (var i = 0; i < n; i++) {
        var x = X[i];
        var y = Y[i];
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
    var denominator = n * sumXX - sumX * sumX;
    var slope = (n * sumXY - sumX * sumY) / denominator;
    var intercept = (sumY * sumXX - sumX * sumXY) / denominator;
    return { slope: slope, intercept: intercept };
}
exports.linearRegression = linearRegression;
