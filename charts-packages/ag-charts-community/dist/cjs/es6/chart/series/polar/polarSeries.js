"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const series_1 = require("../series");
const chartAxis_1 = require("../../chartAxis");
const seriesMarker_1 = require("../seriesMarker");
class PolarSeries extends series_1.Series {
    constructor() {
        super(...arguments);
        this.directionKeys = {
            [chartAxis_1.ChartAxisDirection.X]: ['angleKey'],
            [chartAxis_1.ChartAxisDirection.Y]: ['radiusKey']
        };
        /**
         * The center of the polar series (for example, the center of a pie).
         * If the polar chart has multiple series, all of them will have their
         * center set to the same value as a result of the polar chart layout.
         * The center coordinates are not supposed to be set by the user.
         */
        this.centerX = 0;
        this.centerY = 0;
        /**
         * The maximum radius the series can use.
         * This value is set automatically as a result of the polar chart layout
         * and is not supposed to be set by the user.
         */
        this.radius = 0;
    }
}
exports.PolarSeries = PolarSeries;
class PolarSeriesMarker extends seriesMarker_1.SeriesMarker {
}
exports.PolarSeriesMarker = PolarSeriesMarker;
//# sourceMappingURL=polarSeries.js.map