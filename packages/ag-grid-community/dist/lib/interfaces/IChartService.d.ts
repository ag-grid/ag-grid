// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { ChartRangeParams } from "../gridApi";
export interface IChartService {
    chartCurrentRange(chartType: ChartType): ChartRef | undefined;
    chartCellRange(params: ChartRangeParams): ChartRef | undefined;
    pivotChart(chartType: ChartType): ChartRef | undefined;
}
