import { CartesianChart, CartesianChartOptions } from "./cartesianChart";
import { Axis } from "../axis";
import Scale from "../scale/scale";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
export declare type GroupedCategoryChartAxis = GroupedCategoryAxis | Axis<Scale<any, number>>;
export interface GroupedCategoryChartOptions extends CartesianChartOptions<GroupedCategoryChartAxis, GroupedCategoryChartAxis> {
}
export declare class GroupedCategoryChart extends CartesianChart<GroupedCategoryChartAxis, GroupedCategoryChartAxis> {
    constructor(options: GroupedCategoryChartOptions);
    updateAxes(): void;
}
