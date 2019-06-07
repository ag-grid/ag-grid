// ag-grid-enterprise v21.0.1
import { Chart } from "./chart";
import { Axis } from "../axis";
import { Series } from "./series/series";
import { ClipRect } from "../scene/clipRect";
export declare class CartesianChart extends Chart {
    private axisAutoPadding;
    constructor(xAxis: Axis, yAxis: Axis);
    private seriesClipRect;
    readonly seriesRoot: ClipRect;
    private readonly _xAxis;
    readonly xAxis: Axis;
    private readonly _yAxis;
    readonly yAxis: Axis;
    series: Series<CartesianChart>[];
    performLayout(): void;
    updateAxes(): void;
}
