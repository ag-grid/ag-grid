import { CartesianChart } from "./cartesianChart";
import { GroupedCategoryAxis } from "./axis/groupedCategoryAxis";
import { ChartAxis } from "./chartAxis";

export type GroupedCategoryChartAxis = GroupedCategoryAxis | ChartAxis;

export class GroupedCategoryChart extends CartesianChart {
    static className = 'GroupedCategoryChart';
    static type = 'groupedCategory' as const;
}
