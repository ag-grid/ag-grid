import { Series } from "../series";
import { ChartAxisDirection } from "../../chartAxis";
import { SeriesMarker, SeriesMarkerFormatterParams } from "../seriesMarker";
import { chainObjects } from "../../../util/object";

export abstract class CartesianSeries extends Series {
    static defaults = chainObjects(Series.defaults, {});

    directionKeys: { [key in ChartAxisDirection]?: string[] } = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKey']
    };
}

export interface CartesianSeriesMarkerFormat {
    fill?: string,
    stroke?: string,
    strokeWidth?: number,
    size?: number
}
export class CartesianSeriesMarker extends SeriesMarker {
    formatter?: (params: CartesianSeriesMarkerFormatterParams) => CartesianSeriesMarkerFormat;
}

export interface CartesianSeriesMarkerFormatterParams extends SeriesMarkerFormatterParams {
    xKey: string;
    yKey: string;
}
