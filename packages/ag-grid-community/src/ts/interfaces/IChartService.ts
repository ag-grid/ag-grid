import { ChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { ChartRangeParams, CreatePivotChartParams } from "../gridApi";

export interface IChartService {
    chartCurrentRange(chartType: ChartType): ChartRef | undefined;
    chartCellRange(params: ChartRangeParams): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
}