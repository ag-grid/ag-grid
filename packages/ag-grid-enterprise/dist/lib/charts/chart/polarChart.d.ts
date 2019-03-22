// ag-grid-enterprise v20.2.0
import { Chart } from "./chart";
import { PolarSeries } from "./series/polarSeries";
export declare class PolarChart<D, X, Y> extends Chart<D, X, Y> {
    centerX: number;
    centerY: number;
    radius: number;
    protected _series: PolarSeries<D, X, Y>[];
    addSeries(series: PolarSeries<D, X, Y>): void;
    performLayout(): void;
}
