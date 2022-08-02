"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const series_1 = require("../series");
const chartAxis_1 = require("../../chartAxis");
const seriesMarker_1 = require("../seriesMarker");
const changeDetectable_1 = require("../../../scene/changeDetectable");
class PolarSeries extends series_1.Series {
    constructor() {
        super({ pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH] });
        this.directionKeys = {
            [chartAxis_1.ChartAxisDirection.X]: ['angleKey'],
            [chartAxis_1.ChartAxisDirection.Y]: ['radiusKey'],
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
    getLabelData() {
        return [];
    }
}
exports.PolarSeries = PolarSeries;
class PolarSeriesMarker extends seriesMarker_1.SeriesMarker {
}
__decorate([
    changeDetectable_1.SceneChangeDetection({ redraw: changeDetectable_1.RedrawType.MAJOR })
], PolarSeriesMarker.prototype, "formatter", void 0);
exports.PolarSeriesMarker = PolarSeriesMarker;
