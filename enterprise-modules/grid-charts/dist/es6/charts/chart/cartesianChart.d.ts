import { Chart, ChartOptions } from "./chart";
import { Axis, ILinearAxis } from "../axis";
import Scale from "../scale/scale";
import { Series } from "./series/series";
import { Padding } from "../util/padding";
import { Group } from "../scene/group";
/** Defines the orientation used when rendering data series */
export declare enum CartesianChartLayout {
    Vertical = 0,
    Horizontal = 1
}
export interface CartesianChartOptions<TX extends ILinearAxis = Axis<Scale<any, number>>, TY extends ILinearAxis = Axis<Scale<any, number>>> extends ChartOptions {
    xAxis: TX;
    yAxis: TY;
}
export declare class CartesianChart<TX extends ILinearAxis = Axis<Scale<any, number>>, TY extends ILinearAxis = Axis<Scale<any, number>>> extends Chart {
    protected axisAutoPadding: Padding;
    constructor(options: CartesianChartOptions<TX, TY>);
    private _seriesRoot;
    readonly seriesRoot: Group;
    private readonly _xAxis;
    readonly xAxis: TX;
    private readonly _yAxis;
    readonly yAxis: TY;
    series: Series<CartesianChart<TX, TY>>[];
    performLayout(): void;
    private _layout;
    layout: CartesianChartLayout;
    updateAxes(): void;
}
