import { ChartType } from "../charts/chartType";
import { ChartRef } from "../entities/gridOptions";
import { ChartRangeParams } from "../gridApi";

export interface IRangeChartService {
    chartCurrentRange(chartType: ChartType): ChartRef | undefined;
    chartCellRange(params: ChartRangeParams): ChartRef | undefined;
}