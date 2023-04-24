"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarSeries = void 0;
const series_1 = require("../series");
const chartAxisDirection_1 = require("../../chartAxisDirection");
class PolarSeries extends series_1.Series {
    constructor({ useLabelLayer = false }) {
        super({
            useLabelLayer,
            pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH],
            directionKeys: {
                [chartAxisDirection_1.ChartAxisDirection.X]: ['angleKey'],
                [chartAxisDirection_1.ChartAxisDirection.Y]: ['radiusKey'],
            },
        });
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
    getLabelData() {
        return [];
    }
    computeLabelsBBox(_options) {
        return null;
    }
}
exports.PolarSeries = PolarSeries;
