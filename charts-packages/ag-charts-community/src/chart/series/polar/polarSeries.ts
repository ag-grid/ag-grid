import { Series, SeriesNodeDatum, SeriesNodeDataContext } from "../series";
import { ChartAxisDirection } from "../../chartAxis";
import { SeriesMarker, SeriesMarkerFormatterParams } from "../seriesMarker";

export abstract class PolarSeries<S extends SeriesNodeDatum> extends Series<SeriesNodeDataContext<S>> {

    directionKeys = {
        [ChartAxisDirection.X]: ['angleKey'],
        [ChartAxisDirection.Y]: ['radiusKey']
    };

    /**
     * The center of the polar series (for example, the center of a pie).
     * If the polar chart has multiple series, all of them will have their
     * center set to the same value as a result of the polar chart layout.
     * The center coordinates are not supposed to be set by the user.
     */
    centerX: number = 0;
    centerY: number = 0;

    /**
     * The maximum radius the series can use.
     * This value is set automatically as a result of the polar chart layout
     * and is not supposed to be set by the user.
     */
    radius: number = 0;
}

export class PolarSeriesMarker extends SeriesMarker {
    formatter?: (params: PolarSeriesMarkerFormatterParams) => {
        fill?: string,
        stroke?: string,
        strokeWidth: number,
        size: number
    };
}

export interface PolarSeriesMarkerFormatterParams extends SeriesMarkerFormatterParams {
    angleKey: string;
    radiusKey: string;
}
