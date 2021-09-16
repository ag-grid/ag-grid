import { Series } from "../series";
import { ChartAxisDirection } from "../../chartAxis";
import { SeriesMarker, SeriesMarkerFormatterParams } from "../seriesMarker";
import { isContinuous, isDiscrete } from "../../../util/value";

export abstract class CartesianSeries extends Series {
    directionKeys: { [key in ChartAxisDirection]?: string[] } = {
        [ChartAxisDirection.X]: ['xKey'],
        [ChartAxisDirection.Y]: ['yKey']
    };

    protected checkDomainXY<T, K>(x: T, y: K, isContinuousX: boolean, isContinuousY: boolean): [T, K] | undefined {
        const isValidDatum =
            (isContinuousX && isContinuous(x) || isDiscrete(x)) &&
            (isContinuousY && isContinuous(y) || isDiscrete(y));
        return isValidDatum ? [x, y] : undefined;
    }

    protected checkRangeXY(x: number, y: number): boolean {
        return !isNaN(x) && !isNaN(y) && this.xAxis!.inRange(x) && this.yAxis!.inRange(y);
    }
}

export interface CartesianSeriesMarkerFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    size?: number;
}

export class CartesianSeriesMarker extends SeriesMarker {
    formatter?: (params: CartesianSeriesMarkerFormatterParams) => CartesianSeriesMarkerFormat;
}

export interface CartesianSeriesMarkerFormatterParams extends SeriesMarkerFormatterParams {
    xKey: string;
    yKey: string;
}
