import { CartesianChart } from "./cartesianChart";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { ChartAxis } from "./chartAxis";
export declare type GroupedCategoryChartAxis = GroupedCategoryAxis | ChartAxis;
export declare class GroupedCategoryChart extends CartesianChart {
    updateAxes(): void;
}
