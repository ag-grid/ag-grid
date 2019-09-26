// ag-grid-enterprise v21.2.2
/**
 * Returns `{slope, intercept}` for `y = slope * x + intercept` given two arrays of variables.
 * @param X Array of independent variables.
 * @param Y Array of dependent variables.
 */
export declare function linearRegression(X: number[], Y: number[]): {
    slope: number;
    intercept: number;
} | undefined;
