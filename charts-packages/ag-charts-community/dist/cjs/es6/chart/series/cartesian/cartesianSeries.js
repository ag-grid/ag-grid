"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const series_1 = require("../series");
const chartAxis_1 = require("../../chartAxis");
const seriesMarker_1 = require("../seriesMarker");
const value_1 = require("../../../util/value");
class CartesianSeries extends series_1.Series {
    constructor() {
        super(...arguments);
        this.directionKeys = {
            [chartAxis_1.ChartAxisDirection.X]: ['xKey'],
            [chartAxis_1.ChartAxisDirection.Y]: ['yKey']
        };
    }
    /**
     * Note: we are passing `isContinuousX` and `isContinuousY` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param x A domain value to be plotted along the x-axis.
     * @param y A domain value to be plotted along the y-axis.
     * @param isContinuousX Typically this will be the value of `xAxis.scale instanceof ContinuousScale`.
     * @param isContinuousY Typically this will be the value of `yAxis.scale instanceof ContinuousScale`.
     * @returns `[x, y]`, if both x and y are valid domain values for their respective axes/scales, or `undefined`.
     */
    checkDomainXY(x, y, isContinuousX, isContinuousY) {
        const isValidDatum = (isContinuousX && value_1.isContinuous(x) || value_1.isDiscrete(x)) &&
            (isContinuousY && value_1.isContinuous(y) || value_1.isDiscrete(y));
        return isValidDatum ? [x, y] : undefined;
    }
    /**
     * Note: we are passing the xAxis and yAxis because the calling code is supposed to make sure
     *       that series has both of them defined, and also to avoid one level of indirection,
     *       e.g. `this.xAxis!.inRange(x)`, both of which are suboptimal in tight loops where this method is used.
     * @param x A range value to be plotted along the x-axis.
     * @param y A range value to be plotted along the y-axis.
     * @param xAxis The series' x-axis.
     * @param yAxis The series' y-axis.
     * @returns
     */
    checkRangeXY(x, y, xAxis, yAxis) {
        return !isNaN(x) && !isNaN(y) && xAxis.inRange(x) && yAxis.inRange(y);
    }
}
exports.CartesianSeries = CartesianSeries;
class CartesianSeriesMarker extends seriesMarker_1.SeriesMarker {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
exports.CartesianSeriesMarker = CartesianSeriesMarker;
//# sourceMappingURL=cartesianSeries.js.map