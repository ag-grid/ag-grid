// ag-grid-enterprise v21.1.1
import { Chart } from "./chart";
import { Axis } from "../axis";
import Scale from "../scale/scale";
import { Series } from "./series/series";
import { Group } from "../scene/group";
export declare type CartesianChartLayout = 'vertical' | 'horizontal';
export declare class CartesianChart extends Chart {
    private axisAutoPadding;
    constructor(xAxis: Axis<Scale<any, number>>, yAxis: Axis<Scale<any, number>>);
    private seriesClipRect;
    readonly seriesRoot: Group;
    private readonly _xAxis;
    readonly xAxis: Axis<Scale<any, number>>;
    private readonly _yAxis;
    readonly yAxis: Axis<Scale<any, number>>;
    series: Series<CartesianChart>[];
    performLayout(): void;
    private _layout;
    layout: CartesianChartLayout;
    updateAxes(): void;
}
