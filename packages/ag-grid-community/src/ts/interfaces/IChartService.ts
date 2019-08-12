import {ChartType} from "./iChartOptions";
import {ChartRef} from "../entities/gridOptions";
import {ChartRangeParams} from "../gridApi";

export interface IChartService {
    chartCurrentRange(chartType: ChartType): ChartRef | undefined;
    chartCellRange(params: ChartRangeParams): ChartRef | undefined;
    pivotChart(chartType: ChartType): ChartRef | undefined;
}