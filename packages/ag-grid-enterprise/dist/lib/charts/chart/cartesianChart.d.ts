// ag-grid-enterprise v20.2.0
import { Chart } from "./chart";
import { Axis } from "../axis";
import { Series } from "./series/series";
export declare class CartesianChart<D, X, Y> extends Chart<D, X, Y> {
    constructor(xAxis: Axis<X>, yAxis: Axis<Y>, parent?: HTMLElement);
    private seriesClipRect;
    private readonly _xAxis;
    readonly xAxis: Axis<X>;
    private readonly _yAxis;
    readonly yAxis: Axis<Y>;
    addSeries(series: Series<D, X, Y>): void;
    performLayout(): void;
    updateAxes(): void;
}
