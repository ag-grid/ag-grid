import { Series, SeriesNodePickMode } from '../series.mjs';
import { ChartAxisDirection } from '../../chartAxisDirection.mjs';
export class PolarSeries extends Series {
    constructor({ moduleCtx, useLabelLayer = false, pickModes = [SeriesNodePickMode.EXACT_SHAPE_MATCH], }) {
        super({
            moduleCtx,
            useLabelLayer,
            pickModes,
            contentGroupVirtual: false,
            directionKeys: {
                [ChartAxisDirection.X]: ['angleKey'],
                [ChartAxisDirection.Y]: ['radiusKey'],
            },
            directionNames: {
                [ChartAxisDirection.X]: ['angleName'],
                [ChartAxisDirection.Y]: ['radiusName'],
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
    computeLabelsBBox(_options, _seriesRect) {
        return null;
    }
}
