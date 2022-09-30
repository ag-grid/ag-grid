var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Series, SeriesNodePickMode } from '../series';
import { ChartAxisDirection } from '../../chartAxis';
import { SeriesMarker } from '../seriesMarker';
import { RedrawType, SceneChangeDetection } from '../../../scene/changeDetectable';
export class PolarSeries extends Series {
    constructor({ useLabelLayer = false }) {
        super({ useLabelLayer, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
        this.directionKeys = {
            [ChartAxisDirection.X]: ['angleKey'],
            [ChartAxisDirection.Y]: ['radiusKey'],
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
export class PolarSeriesMarker extends SeriesMarker {
}
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], PolarSeriesMarker.prototype, "formatter", void 0);
