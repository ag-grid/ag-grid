import { Series, SeriesNodePickMode } from '../series';
import { ChartAxisDirection } from '../../chartAxis';
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
