// ag-grid-enterprise v21.2.2
import { Chart } from "./chart";
import { CartesianChartLayout } from "./cartesianChart";
import { Axis } from "../axis";
import Scale from "../scale/scale";
import { Series } from "./series/series";
import { Group } from "../scene/group";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
declare type GroupedCategoryChartAxis = GroupedCategoryAxis | Axis<Scale<any, number>>;
export declare type GroupedCategoryChartOptions = {
    xAxis: GroupedCategoryChartAxis;
    yAxis: GroupedCategoryChartAxis;
    document?: Document;
};
export declare class GroupedCategoryChart extends Chart {
    private axisAutoPadding;
    constructor(options: GroupedCategoryChartOptions);
    private _seriesRoot;
    readonly seriesRoot: Group;
    private readonly _xAxis;
    readonly xAxis: GroupedCategoryChartAxis;
    private readonly _yAxis;
    readonly yAxis: GroupedCategoryChartAxis;
    series: Series<GroupedCategoryChart>[];
    performLayout(): void;
    private _layout;
    layout: CartesianChartLayout;
    updateAxes(): void;
}
export {};
