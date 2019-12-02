import { Chart } from "./chart";
import { Padding } from "../util/padding";
import { Group } from "../scene/group";
import { Series } from "./series/series";
/** Defines the orientation used when rendering data series */
export declare enum CartesianChartLayout {
    Vertical = 0,
    Horizontal = 1
}
export declare class CartesianChart extends Chart {
    static className: string;
    protected axisAutoPadding: Padding;
    flipXY: boolean;
    constructor(document?: Document);
    private _seriesRoot;
    readonly seriesRoot: Group;
    performLayout(): void;
    private _layout;
    layout: CartesianChartLayout;
    private _updateAxes;
    protected initSeries(series: Series): void;
    protected freeSeries(series: Series): void;
    updateAxes(): void;
}
