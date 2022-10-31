import { Series, SeriesNodeDatum, SeriesNodeDataContext } from '../series';
import { PointLabelDatum } from '../../../util/labelPlacement';
export declare abstract class PolarSeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {
    directionKeys: {
        x: string[];
        y: string[];
    };
    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number;
    centerY: number;
    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number;
    constructor({ useLabelLayer }: {
        useLabelLayer?: boolean | undefined;
    });
    getLabelData(): PointLabelDatum[];
}
